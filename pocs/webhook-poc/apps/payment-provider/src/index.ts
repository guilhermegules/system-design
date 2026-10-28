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

export interface PaymentIntent {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderConfig {
  inboundOrderSecret?: string;
  autoProcessPayments?: boolean;
  simulatePaymentFailureForOrders?: Set<string>;
  dispatcherOptions?: DispatcherOptions;
}

export class PaymentProviderApp {
  public readonly paymentIntents = new Map<string, PaymentIntent>();
  public readonly idempotencyStore = new IdempotencyStore();
  public readonly dispatcher: WebhookDispatcher;
  public autoProcessPayments: boolean;
  public readonly simulatePaymentFailureForOrders: Set<string>;
  private readonly inboundOrderSecret: string;
  private server?: Server;

  constructor(config: PaymentProviderConfig = {}) {
    this.inboundOrderSecret = config.inboundOrderSecret ?? 'whsec_order_to_payment_secret';
    this.autoProcessPayments = config.autoProcessPayments ?? true;
    this.simulatePaymentFailureForOrders = config.simulatePaymentFailureForOrders ?? new Set();
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

  public async chargeOrder(
    orderId: string,
    outcome: 'SUCCEEDED' | 'FAILED' = 'SUCCEEDED',
    failureReason?: string,
  ): Promise<PaymentIntent | undefined> {
    const intent = Array.from(this.paymentIntents.values()).find((p) => p.orderId === orderId);
    if (!intent) return undefined;

    intent.status = outcome;
    intent.updatedAt = new Date().toISOString();

    if (outcome === 'SUCCEEDED') {
      await this.dispatcher.dispatch('payment.succeeded', 'payment-provider', {
        orderId: intent.orderId,
        paymentIntentId: intent.id,
        amount: intent.amount,
        currency: intent.currency,
      });
    } else {
      intent.failureReason = failureReason ?? 'Insufficient funds';
      await this.dispatcher.dispatch('payment.failed', 'payment-provider', {
        orderId: intent.orderId,
        paymentIntentId: intent.id,
        amount: intent.amount,
        failureReason: intent.failureReason,
      });
    }

    return intent;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', service: 'payment-provider' });
      return;
    }

    if (method === 'GET' && url.pathname === '/payments') {
      sendJson(res, 200, Array.from(this.paymentIntents.values()));
      return;
    }

    // Inbound Webhook from Order Service (`order.created`)
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

      if (event.type === 'order.created') {
        const order = event.data;
        const now = new Date().toISOString();
        const intent: PaymentIntent = {
          id: `pi_${randomUUID().slice(0, 8)}`,
          orderId: order.id,
          customerId: order.customerId,
          amount: order.totalAmount,
          currency: order.currency,
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        };
        this.paymentIntents.set(intent.id, intent);

        if (this.autoProcessPayments) {
          const shouldFail =
            this.simulatePaymentFailureForOrders.has(order.id) ||
            order.customerEmail.includes('decline');
          await this.chargeOrder(
            order.id,
            shouldFail ? 'FAILED' : 'SUCCEEDED',
            shouldFail ? 'Card declined by issuer (insufficient funds)' : undefined,
          );
        }
      }

      sendJson(res, 200, { received: true, duplicate: false });
      return;
    }

    // Manual trigger endpoint: POST /payments/:orderId/charge
    if (method === 'POST' && url.pathname.startsWith('/payments/')) {
      const parts = url.pathname.split('/');
      const orderId = parts[2];
      const raw = await readRawBody(req);
      const body = raw
        ? (JSON.parse(raw) as { outcome?: 'SUCCEEDED' | 'FAILED'; failureReason?: string })
        : {};
      const updated = await this.chargeOrder(
        orderId,
        body.outcome ?? 'SUCCEEDED',
        body.failureReason,
      );
      if (!updated) {
        sendJson(res, 404, { error: `Payment intent for order ${orderId} not found` });
        return;
      }
      sendJson(res, 200, updated);
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  }
}
