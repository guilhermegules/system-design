import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import {
  IdempotencyStore,
  readRawBody,
  sendJson,
  verifyWebhookSignature,
  WEBHOOK_SIGNATURE_HEADER,
  WebhookDispatcher,
  type DispatcherOptions,
  type Order,
  type WebhookEvent,
} from '@webhook-poc/webhook-kit';

export interface ShipmentRecord {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  shippingAddress: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProviderConfig {
  inboundOrderSecret?: string;
  autoAdvanceShipment?: boolean;
  carrier?: string;
  dispatcherOptions?: DispatcherOptions;
}

export class ShippingProviderApp {
  public readonly shipments = new Map<string, ShipmentRecord>();
  public readonly idempotencyStore = new IdempotencyStore();
  public readonly dispatcher: WebhookDispatcher;
  public autoAdvanceShipment: boolean;
  private readonly inboundOrderSecret: string;
  private readonly carrier: string;
  private server?: Server;

  constructor(config: ShippingProviderConfig = {}) {
    this.inboundOrderSecret = config.inboundOrderSecret ?? 'whsec_order_to_shipping_secret';
    this.autoAdvanceShipment = config.autoAdvanceShipment ?? true;
    this.carrier = config.carrier ?? 'FastExpress';
    this.dispatcher = new WebhookDispatcher(config.dispatcherOptions);
  }

  public async start(port: number = 0): Promise<number> {
    this.server = createServer((req, res) => {
      this.handleRequest(req, res).catch((err) => {
        sendJson(res, 500, { error: 'Internal Server Error', details: String(err) });
      });
    });

    return new Promise((resolve) => {
      this.server!.listen(port, '127.0.0.1', () => {
        const address = this.server!.address() as AddressInfo;
        resolve(address.port);
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.server) return;
    return new Promise((resolve, reject) => {
      this.server!.close((err) => (err ? reject(err) : resolve()));
    });
  }

  public async advanceShipmentStatus(
    orderId: string,
    targetStatus: 'IN_TRANSIT' | 'DELIVERED',
  ): Promise<ShipmentRecord | undefined> {
    const shipment = Array.from(this.shipments.values()).find((s) => s.orderId === orderId);
    if (!shipment) return undefined;

    shipment.status = targetStatus;
    shipment.updatedAt = new Date().toISOString();

    const eventType = targetStatus === 'IN_TRANSIT' ? 'shipment.in_transit' : 'shipment.delivered';
    await this.dispatcher.dispatch(eventType, 'shipping-provider', {
      orderId: shipment.orderId,
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
    });

    return shipment;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', service: 'shipping-provider' });
      return;
    }

    if (method === 'GET' && url.pathname === '/shipments') {
      sendJson(res, 200, Array.from(this.shipments.values()));
      return;
    }

    // Inbound Webhook from Order Service (`order.paid`)
    if (method === 'POST' && url.pathname === '/webhooks/orders') {
      const rawBody = await readRawBody(req);
      const sigHeader = req.headers[WEBHOOK_SIGNATURE_HEADER] as string | undefined;

      const verification = verifyWebhookSignature(rawBody, sigHeader, this.inboundOrderSecret);
      if (!verification.valid) {
        sendJson(res, 401, { error: 'Invalid webhook signature', reason: verification.reason });
        return;
      }

      const event = JSON.parse(rawBody) as WebhookEvent<Order>;
      if (this.idempotencyStore.hasProcessed(event.id)) {
        sendJson(res, 200, { received: true, duplicate: true, eventId: event.id });
        return;
      }

      this.idempotencyStore.markProcessed(event.id, event.type);

      if (event.type === 'order.paid') {
        const order = event.data;
        const now = new Date().toISOString();
        const shipment: ShipmentRecord = {
          id: `shp_${randomUUID().slice(0, 8)}`,
          orderId: order.id,
          trackingNumber: `TRK-${randomUUID().slice(0, 8).toUpperCase()}`,
          carrier: this.carrier,
          shippingAddress: order.shippingAddress,
          status: 'CREATED',
          createdAt: now,
          updatedAt: now,
        };
        this.shipments.set(shipment.id, shipment);

        await this.dispatcher.dispatch('shipment.created', 'shipping-provider', {
          orderId: shipment.orderId,
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          carrier: shipment.carrier,
        });

        if (this.autoAdvanceShipment) {
          await this.advanceShipmentStatus(order.id, 'IN_TRANSIT');
          await this.advanceShipmentStatus(order.id, 'DELIVERED');
        }
      }

      sendJson(res, 200, { received: true, duplicate: false });
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  }
}
