import {
  signWebhookPayload,
  WEBHOOK_SIGNATURE_HEADER,
  type Order,
  type WebhookDeliveryRecord,
} from '@webhook-poc/webhook-kit';
import { OrderServiceApp } from '@webhook-poc/order-service';
import { PaymentProviderApp } from '@webhook-poc/payment-provider';
import { ShippingProviderApp } from '@webhook-poc/shipping-provider';
import { NotificationServiceApp } from '@webhook-poc/notification-service';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function banner(title: string): void {
  console.log(`\n${C.bold}${C.cyan}================================================================================${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ${title}${C.reset}`);
  console.log(`${C.bold}${C.cyan}================================================================================${C.reset}`);
}

function logDelivery(sourceName: string, record: WebhookDeliveryRecord): void {
  const lastAttempt = record.attempts[record.attempts.length - 1];
  if (record.status === 'succeeded') {
    console.log(
      `  ${C.green}✔ [WEBHOOK DELIVERED]${C.reset} ${C.bold}${sourceName}${C.reset} -> ${C.magenta}${record.subscriberName}${C.reset} | event=${C.cyan}${record.eventType}${C.reset} (${record.eventId}) | attempts=${record.attempts.length} | HTTP ${lastAttempt?.statusCode} (${lastAttempt?.durationMs}ms)`,
    );
  } else if (record.status === 'retrying') {
    console.log(
      `  ${C.yellow}↻ [WEBHOOK RETRYING]${C.reset}  ${C.bold}${sourceName}${C.reset} -> ${C.magenta}${record.subscriberName}${C.reset} | event=${C.cyan}${record.eventType}${C.reset} | attempt #${record.attempts.length} failed (${lastAttempt?.error})`,
    );
  } else if (record.status === 'dead_letter') {
    console.log(
      `  ${C.red}✖ [WEBHOOK DLQ]${C.reset}       ${C.bold}${sourceName}${C.reset} -> ${C.magenta}${record.subscriberName}${C.reset} | event=${C.cyan}${record.eventType}${C.reset} | moved to Dead Letter Queue after ${record.attempts.length} attempts`,
    );
  }
}

const SECRETS = {
  orderToPayment: 'whsec_order_to_payment_secret',
  orderToShipping: 'whsec_order_to_shipping_secret',
  orderToNotification: 'whsec_order_to_notification_secret',
  paymentToOrder: 'whsec_payment_to_order_secret',
  shippingToOrder: 'whsec_shipping_to_order_secret',
};

async function runDemo(): Promise<void> {
  banner('WEBHOOK-POC: ORDER FLOW ARCHITECTURE DEMO');

  const orderService = new OrderServiceApp({
    inboundSecrets: {
      payment: SECRETS.paymentToOrder,
      shipping: SECRETS.shippingToOrder,
    },
    dispatcherOptions: {
      maxAttempts: 3,
      baseDelayMs: 60,
      onDeliveryUpdate: (rec) => logDelivery('order-service', rec),
    },
  });

  const paymentProvider = new PaymentProviderApp({
    inboundOrderSecret: SECRETS.orderToPayment,
    autoProcessPayments: true,
    dispatcherOptions: {
      maxAttempts: 3,
      baseDelayMs: 60,
      onDeliveryUpdate: (rec) => logDelivery('payment-provider', rec),
    },
  });

  const shippingProvider = new ShippingProviderApp({
    inboundOrderSecret: SECRETS.orderToShipping,
    autoAdvanceShipment: true,
    dispatcherOptions: {
      maxAttempts: 3,
      baseDelayMs: 60,
      onDeliveryUpdate: (rec) => logDelivery('shipping-provider', rec),
    },
  });

  const notificationService = new NotificationServiceApp({
    inboundOrderSecret: SECRETS.orderToNotification,
  });

  const [orderPort, paymentPort, shippingPort, notificationPort] = await Promise.all([
    orderService.start(0),
    paymentProvider.start(0),
    shippingProvider.start(0),
    notificationService.start(0),
  ]);

  const orderUrl = `http://127.0.0.1:${orderPort}`;
  const paymentUrl = `http://127.0.0.1:${paymentPort}`;
  const shippingUrl = `http://127.0.0.1:${shippingPort}`;
  const notificationUrl = `http://127.0.0.1:${notificationPort}`;

  console.log(`${C.blue}▶ Started 4 Microservices:${C.reset}`);
  console.log(`  • Order Service        : ${orderUrl}`);
  console.log(`  • Payment Provider     : ${paymentUrl}`);
  console.log(`  • Shipping Provider    : ${shippingUrl}`);
  console.log(`  • Notification Service : ${notificationUrl}`);

  // Register Subscriptions
  orderService.dispatcher.registerSubscription({
    subscriberName: 'payment-provider',
    targetUrl: `${paymentUrl}/webhooks/orders`,
    secret: SECRETS.orderToPayment,
    events: ['order.created'],
  });
  orderService.dispatcher.registerSubscription({
    subscriberName: 'shipping-provider',
    targetUrl: `${shippingUrl}/webhooks/orders`,
    secret: SECRETS.orderToShipping,
    events: ['order.paid'],
  });
  orderService.dispatcher.registerSubscription({
    subscriberName: 'notification-service',
    targetUrl: `${notificationUrl}/webhooks/orders`,
    secret: SECRETS.orderToNotification,
    events: [
      'order.created',
      'order.paid',
      'order.payment_failed',
      'order.shipped',
      'order.delivered',
      'order.cancelled',
    ],
  });
  paymentProvider.dispatcher.registerSubscription({
    subscriberName: 'order-service',
    targetUrl: `${orderUrl}/webhooks/inbound/payment`,
    secret: SECRETS.paymentToOrder,
    events: ['payment.succeeded', 'payment.failed'],
  });
  shippingProvider.dispatcher.registerSubscription({
    subscriberName: 'order-service',
    targetUrl: `${orderUrl}/webhooks/inbound/shipping`,
    secret: SECRETS.shippingToOrder,
    events: ['shipment.created', 'shipment.in_transit', 'shipment.delivered'],
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Happy Path Order Flow
  // ---------------------------------------------------------------------------
  banner('SCENARIO 1: Happy Path Order Lifecycle (Order -> Payment -> Shipping -> Delivered)');
  const createRes = await fetch(`${orderUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_01',
      customerEmail: 'guilherme@example.com',
      shippingAddress: 'Av. Paulista 1000, Sao Paulo, SP',
      items: [
        { sku: 'LAPTOP-PRO', name: 'Developer Laptop 16"', quantity: 1, unitPrice: 2400.0 },
        { sku: 'DOCK-TB4', name: 'Thunderbolt 4 Dock', quantity: 1, unitPrice: 299.0 },
      ],
    }),
  });
  const createdOrder = (await createRes.json()) as Order;
  const finalOrderRes = await fetch(`${orderUrl}/orders/${createdOrder.id}`);
  const finalOrder = (await finalOrderRes.json()) as Order;

  console.log(`\n${C.bold}Order #${finalOrder.id} Final State:${C.reset} ${C.green}${finalOrder.status}${C.reset}`);
  console.log(`${C.bold}Payment Intent:${C.reset} ${finalOrder.paymentIntentId} | ${C.bold}Tracking:${C.reset} ${finalOrder.carrier} #${finalOrder.trackingNumber}`);
  console.log(`${C.bold}Order Timeline (driven 100% by Webhooks):${C.reset}`);
  for (const step of finalOrder.timeline) {
    console.log(
      `  • [${step.status.padEnd(19)}] ${step.reason} ${step.webhookEventId ? C.dim + `(via ${step.webhookEventId})` + C.reset : ''}`,
    );
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Transient Outage + Exponential Backoff Recovery
  // ---------------------------------------------------------------------------
  banner('SCENARIO 2: Transient Outage & Exponential Backoff Retry');
  console.log(`${C.yellow}⚡ Injecting 2 transient HTTP 503 failures into Notification Service...${C.reset}\n`);
  notificationService.failNextRequestsCount = 2;
  paymentProvider.autoProcessPayments = false;

  await fetch(`${orderUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_02',
      customerEmail: 'resilience@example.com',
      shippingAddress: '100 Market St, San Francisco, CA',
      items: [{ sku: 'KEYCAP-SET', name: 'PBT Keycap Set', quantity: 1, unitPrice: 79.0 }],
    }),
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Security — Forged HMAC Signature Rejection
  // ---------------------------------------------------------------------------
  banner('SCENARIO 3: Webhook Security (Forged HMAC-SHA256 Signature Attack)');
  const maliciousPayload = JSON.stringify({
    id: 'evt_malicious_01',
    type: 'payment.succeeded',
    createdAt: new Date().toISOString(),
    source: 'attacker',
    data: { orderId: createdOrder.id, paymentIntentId: 'pi_fake', amount: 2699.0 },
  });
  const forgedSig = signWebhookPayload(maliciousPayload, 'whsec_invalid_hacker_secret');
  const attackRes = await fetch(`${orderUrl}/webhooks/inbound/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [WEBHOOK_SIGNATURE_HEADER]: forgedSig,
    },
    body: maliciousPayload,
  });
  const attackBody = await attackRes.json();
  console.log(
    `  ${C.red}🛡️  Blocked Forged Webhook:${C.reset} HTTP ${attackRes.status} -> ${JSON.stringify(attackBody)}`,
  );

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Dead Letter Queue (DLQ) & Manual Replay
  // ---------------------------------------------------------------------------
  banner('SCENARIO 4: Exhausted Retries -> Dead Letter Queue (DLQ) -> Replay');
  console.log(`${C.yellow}⚡ Injecting persistent outage (5 failures > 3 maxAttempts) into Notification Service...${C.reset}\n`);
  notificationService.failNextRequestsCount = 5;

  await fetch(`${orderUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_03',
      customerEmail: 'dlq-demo@example.com',
      shippingAddress: '350 Fifth Ave, New York, NY',
      items: [{ sku: 'CHAIR-ERGO', name: 'Ergonomic Mesh Chair', quantity: 1, unitPrice: 599.0 }],
    }),
  });

  const dlqItems = orderService.dispatcher.getDeadLetterQueue();
  console.log(`\n  ${C.red}📥 Dead Letter Queue Count:${C.reset} ${dlqItems.length} failed delivery (${dlqItems[0].deliveryId})`);
  console.log(`  ${C.green}🔧 Restoring Notification Service health and replaying DLQ item...${C.reset}\n`);
  notificationService.failNextRequestsCount = 0;

  await fetch(`${orderUrl}/webhooks/dlq/${dlqItems[0].deliveryId}/replay`, {
    method: 'POST',
  });
  console.log(
    `\n  ${C.green}✔ Dead Letter Queue Count after Replay:${C.reset} ${orderService.dispatcher.getDeadLetterQueue().length}`,
  );

  await Promise.all([
    orderService.stop(),
    paymentProvider.stop(),
    shippingProvider.stop(),
    notificationService.stop(),
  ]);

  banner('DEMO COMPLETED SUCCESSFULLY');
}

await runDemo();
