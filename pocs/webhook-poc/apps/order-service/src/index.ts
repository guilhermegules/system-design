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
  type OrderEventType,
  type OrderItem,
  type OrderStatus,
  type WebhookEvent,
} from '@webhook-poc/webhook-kit';

export interface CreateOrderInput {
  customerId: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  currency?: string;
}

export interface OrderServiceConfig {
  inboundSecrets?: {
    payment?: string;
    shipping?: string;
  };
  dispatcherOptions?: DispatcherOptions;
}

export class OrderServiceApp {
  public readonly orders = new Map<string, Order>();
  public readonly idempotencyStore = new IdempotencyStore();
  public readonly dispatcher: WebhookDispatcher;
  private readonly paymentSecret: string;
  private readonly shippingSecret: string;
  private server?: Server;

  constructor(config: OrderServiceConfig = {}) {
    this.paymentSecret = config.inboundSecrets?.payment ?? 'whsec_payment_to_order_secret';
    this.shippingSecret = config.inboundSecrets?.shipping ?? 'whsec_shipping_to_order_secret';
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

  private updateOrderStatus(
    order: Order,
    status: OrderStatus,
    reason: string,
    webhookEventId?: string,
  ): void {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.timeline.push({
      status,
      timestamp: order.updatedAt,
      reason,
      webhookEventId,
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';

    // Health check
    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', service: 'order-service' });
      return;
    }

    // Create Order: POST /orders
    if (method === 'POST' && url.pathname === '/orders') {
      const raw = await readRawBody(req);
      const input = JSON.parse(raw) as CreateOrderInput;

      const totalAmount = Number(
        input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2),
      );
      const now = new Date().toISOString();
      const order: Order = {
        id: `ord_${randomUUID().slice(0, 8)}`,
        customerId: input.customerId,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        items: input.items,
        totalAmount,
        currency: input.currency ?? 'USD',
        status: 'PENDING_PAYMENT',
        timeline: [
          {
            status: 'PENDING_PAYMENT',
            timestamp: now,
            reason: 'Order created and awaiting payment confirmation via webhook',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      this.orders.set(order.id, order);

      // Dispatch outbound `order.created` webhook to all subscribed systems
      await this.dispatcher.dispatch('order.created', 'order-service', order);

      sendJson(res, 201, order);
      return;
    }

    // List Orders: GET /orders
    if (method === 'GET' && url.pathname === '/orders') {
      sendJson(res, 200, Array.from(this.orders.values()));
      return;
    }

    // Get Single Order: GET /orders/:id
    if (method === 'GET' && url.pathname.startsWith('/orders/')) {
      const id = url.pathname.split('/')[2];
      const order = this.orders.get(id);
      if (!order) {
        sendJson(res, 404, { error: `Order ${id} not found` });
        return;
      }
      sendJson(res, 200, order);
      return;
    }

    // Register Outbound Webhook Subscription: POST /webhooks/subscriptions
    if (method === 'POST' && url.pathname === '/webhooks/subscriptions') {
      const raw = await readRawBody(req);
      const body = JSON.parse(raw) as {
        subscriberName: string;
        targetUrl: string;
        secret: string;
        events: OrderEventType[];
      };
      const sub = this.dispatcher.registerSubscription(body);
      sendJson(res, 201, sub);
      return;
    }

    // List Subscriptions: GET /webhooks/subscriptions
    if (method === 'GET' && url.pathname === '/webhooks/subscriptions') {
      sendJson(res, 200, this.dispatcher.listSubscriptions());
      return;
    }

    // List Outbound Webhook Deliveries: GET /webhooks/deliveries
    if (method === 'GET' && url.pathname === '/webhooks/deliveries') {
      sendJson(res, 200, this.dispatcher.getDeliveries());
      return;
    }

    // List Dead Letter Queue: GET /webhooks/dlq
    if (method === 'GET' && url.pathname === '/webhooks/dlq') {
      sendJson(res, 200, this.dispatcher.getDeadLetterQueue());
      return;
    }

    // Replay Dead Letter Queue Delivery: POST /webhooks/dlq/:deliveryId/replay
    if (method === 'POST' && url.pathname.startsWith('/webhooks/dlq/')) {
      const parts = url.pathname.split('/');
      const deliveryId = parts[3];
      const replayed = await this.dispatcher.replayDelivery(deliveryId);
      if (!replayed) {
        sendJson(res, 404, { error: `Delivery ${deliveryId} not found` });
        return;
      }
      sendJson(res, 200, replayed);
      return;
    }

    // Inbound Webhook from Payment Provider: POST /webhooks/inbound/payment
    if (method === 'POST' && url.pathname === '/webhooks/inbound/payment') {
      await this.handleInboundPaymentWebhook(req, res);
      return;
    }

    // Inbound Webhook from Shipping Provider: POST /webhooks/inbound/shipping
    if (method === 'POST' && url.pathname === '/webhooks/inbound/shipping') {
      await this.handleInboundShippingWebhook(req, res);
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  }

  private async handleInboundPaymentWebhook(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const rawBody = await readRawBody(req);
    const sigHeader = req.headers[WEBHOOK_SIGNATURE_HEADER] as string | undefined;

    const verification = verifyWebhookSignature(rawBody, sigHeader, this.paymentSecret);
    if (!verification.valid) {
      sendJson(res, 401, {
        error: 'Invalid webhook signature',
        reason: verification.reason,
      });
      return;
    }

    const event = JSON.parse(rawBody) as WebhookEvent<{
      orderId: string;
      paymentIntentId: string;
      amount: number;
      failureReason?: string;
    }>;

    // Idempotency Check
    if (this.idempotencyStore.hasProcessed(event.id)) {
      sendJson(res, 200, {
        received: true,
        duplicate: true,
        eventId: event.id,
      });
      return;
    }

    const order = this.orders.get(event.data.orderId);
    if (!order) {
      sendJson(res, 404, { error: `Order ${event.data.orderId} not found` });
      return;
    }

    this.idempotencyStore.markProcessed(event.id, event.type);

    if (event.type === 'payment.succeeded') {
      order.paymentIntentId = event.data.paymentIntentId;
      this.updateOrderStatus(
        order,
        'PAID',
        `Payment confirmed via webhook (${event.data.paymentIntentId})`,
        event.id,
      );
      await this.dispatcher.dispatch('order.paid', 'order-service', order);
    } else if (event.type === 'payment.failed') {
      order.paymentIntentId = event.data.paymentIntentId;
      const reason = event.data.failureReason ?? 'Card declined';
      this.updateOrderStatus(
        order,
        'PAYMENT_FAILED',
        `Payment failed via webhook: ${reason}`,
        event.id,
      );
      this.updateOrderStatus(order, 'CANCELLED', 'Order cancelled due to payment failure', event.id);
      await this.dispatcher.dispatch('order.payment_failed', 'order-service', order);
      await this.dispatcher.dispatch('order.cancelled', 'order-service', order);
    }

    sendJson(res, 200, { received: true, duplicate: false, orderStatus: order.status });
  }

  private async handleInboundShippingWebhook(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const rawBody = await readRawBody(req);
    const sigHeader = req.headers[WEBHOOK_SIGNATURE_HEADER] as string | undefined;

    const verification = verifyWebhookSignature(rawBody, sigHeader, this.shippingSecret);
    if (!verification.valid) {
      sendJson(res, 401, {
        error: 'Invalid webhook signature',
        reason: verification.reason,
      });
      return;
    }

    const event = JSON.parse(rawBody) as WebhookEvent<{
      orderId: string;
      shipmentId: string;
      trackingNumber: string;
      carrier: string;
    }>;

    // Idempotency Check
    if (this.idempotencyStore.hasProcessed(event.id)) {
      sendJson(res, 200, {
        received: true,
        duplicate: true,
        eventId: event.id,
      });
      return;
    }

    const order = this.orders.get(event.data.orderId);
    if (!order) {
      sendJson(res, 404, { error: `Order ${event.data.orderId} not found` });
      return;
    }

    this.idempotencyStore.markProcessed(event.id, event.type);

    if (event.type === 'shipment.created') {
      order.trackingNumber = event.data.trackingNumber;
      order.carrier = event.data.carrier;
      this.updateOrderStatus(
        order,
        'PROCESSING_SHIPMENT',
        `Shipment label created (${event.data.carrier} #${event.data.trackingNumber})`,
        event.id,
      );
    } else if (event.type === 'shipment.in_transit') {
      order.trackingNumber = event.data.trackingNumber;
      order.carrier = event.data.carrier;
      this.updateOrderStatus(
        order,
        'SHIPPED',
        `Package in transit with ${event.data.carrier} (#${event.data.trackingNumber})`,
        event.id,
      );
      await this.dispatcher.dispatch('order.shipped', 'order-service', order);
    } else if (event.type === 'shipment.delivered') {
      this.updateOrderStatus(
        order,
        'DELIVERED',
        `Package delivered by ${event.data.carrier}`,
        event.id,
      );
      await this.dispatcher.dispatch('order.delivered', 'order-service', order);
    }

    sendJson(res, 200, { received: true, duplicate: false, orderStatus: order.status });
  }
}
