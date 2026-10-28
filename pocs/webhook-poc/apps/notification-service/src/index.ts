import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import {
  IdempotencyStore,
  readRawBody,
  sendJson,
  verifyWebhookSignature,
  WEBHOOK_SIGNATURE_HEADER,
  type Order,
  type OrderEventType,
  type WebhookEvent,
} from '@webhook-poc/webhook-kit';

export interface CustomerNotification {
  id: string;
  orderId: string;
  customerEmail: string;
  eventType: OrderEventType;
  subject: string;
  message: string;
  webhookEventId: string;
  sentAt: string;
}

export interface NotificationServiceConfig {
  inboundOrderSecret?: string;
  failNextRequestsCount?: number;
}

export class NotificationServiceApp {
  public readonly notifications: CustomerNotification[] = [];
  public readonly idempotencyStore = new IdempotencyStore();
  public failNextRequestsCount: number;
  private readonly inboundOrderSecret: string;
  private server?: Server;

  constructor(config: NotificationServiceConfig = {}) {
    this.inboundOrderSecret = config.inboundOrderSecret ?? 'whsec_order_to_notification_secret';
    this.failNextRequestsCount = config.failNextRequestsCount ?? 0;
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

  private buildEmailContent(
    eventType: OrderEventType,
    order: Order,
  ): { subject: string; message: string } {
    switch (eventType) {
      case 'order.created':
        return {
          subject: `Order Received (#${order.id})`,
          message: `We received your order of ${order.totalAmount} ${order.currency} and are awaiting payment confirmation.`,
        };
      case 'order.paid':
        return {
          subject: `Payment Confirmed (#${order.id})`,
          message: `Your payment of ${order.totalAmount} ${order.currency} (${order.paymentIntentId}) succeeded. Preparing shipment!`,
        };
      case 'order.payment_failed':
        return {
          subject: `Payment Failed (#${order.id})`,
          message: `We could not process payment for order #${order.id}.`,
        };
      case 'order.shipped':
        return {
          subject: `Order Shipped (#${order.id})`,
          message: `Your order is on the way via ${order.carrier} (Tracking: ${order.trackingNumber}).`,
        };
      case 'order.delivered':
        return {
          subject: `Order Delivered (#${order.id})`,
          message: `Your package has been delivered to ${order.shippingAddress}. Enjoy!`,
        };
      case 'order.cancelled':
        return {
          subject: `Order Cancelled (#${order.id})`,
          message: `Your order #${order.id} has been cancelled.`,
        };
      default:
        return {
          subject: `Order Update (#${order.id})`,
          message: `Order status changed to ${order.status}.`,
        };
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', service: 'notification-service' });
      return;
    }

    if (method === 'GET' && url.pathname === '/notifications') {
      sendJson(res, 200, this.notifications);
      return;
    }

    // Fault injection endpoint to simulate transient webhook outages
    if (method === 'POST' && url.pathname === '/chaos/fail-next') {
      const raw = await readRawBody(req);
      const body = raw ? (JSON.parse(raw) as { count?: number }) : {};
      this.failNextRequestsCount = body.count ?? 1;
      sendJson(res, 200, { failNextRequestsCount: this.failNextRequestsCount });
      return;
    }

    // Inbound Webhook from Order Service
    if (method === 'POST' && url.pathname === '/webhooks/orders') {
      if (this.failNextRequestsCount > 0) {
        this.failNextRequestsCount -= 1;
        sendJson(res, 503, {
          error: 'Service Temporarily Unavailable (Simulated transient webhook failure)',
          remainingFailures: this.failNextRequestsCount,
        });
        return;
      }

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

      const content = this.buildEmailContent(event.type, event.data);
      this.notifications.push({
        id: `ntf_${randomUUID().slice(0, 8)}`,
        orderId: event.data.id,
        customerEmail: event.data.customerEmail,
        eventType: event.type,
        subject: content.subject,
        message: content.message,
        webhookEventId: event.id,
        sentAt: new Date().toISOString(),
      });

      sendJson(res, 200, { received: true, duplicate: false });
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  }
}
