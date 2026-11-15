import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  signWebhookPayload,
  WEBHOOK_EVENT_HEADER,
  WEBHOOK_ID_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  type Order,
} from '@webhook-poc/webhook-kit';
import { OrderServiceApp } from '@webhook-poc/order-service';
import { PaymentProviderApp } from '@webhook-poc/payment-provider';
import { ShippingProviderApp } from '@webhook-poc/shipping-provider';
import { NotificationServiceApp } from '@webhook-poc/notification-service';

const SECRETS = {
  orderToPayment: 'whsec_order_to_payment_secret',
  orderToShipping: 'whsec_order_to_shipping_secret',
  orderToNotification: 'whsec_order_to_notification_secret',
  paymentToOrder: 'whsec_payment_to_order_secret',
  shippingToOrder: 'whsec_shipping_to_order_secret',
};

describe('Order Webhook Flow - End-to-End Integration Suite', () => {
  let orderService: OrderServiceApp;
  let paymentProvider: PaymentProviderApp;
  let shippingProvider: ShippingProviderApp;
  let notificationService: NotificationServiceApp;

  let orderUrl: string;
  let paymentUrl: string;
  let shippingUrl: string;
  let notificationUrl: string;

  beforeEach(async () => {
    orderService = new OrderServiceApp({
      inboundSecrets: {
        payment: SECRETS.paymentToOrder,
        shipping: SECRETS.shippingToOrder,
      },
      dispatcherOptions: {
        maxAttempts: 3,
        baseDelayMs: 30,
      },
    });

    paymentProvider = new PaymentProviderApp({
      inboundOrderSecret: SECRETS.orderToPayment,
      autoProcessPayments: true,
      dispatcherOptions: { maxAttempts: 3, baseDelayMs: 30 },
    });

    shippingProvider = new ShippingProviderApp({
      inboundOrderSecret: SECRETS.orderToShipping,
      autoAdvanceShipment: true,
      dispatcherOptions: { maxAttempts: 3, baseDelayMs: 30 },
    });

    notificationService = new NotificationServiceApp({
      inboundOrderSecret: SECRETS.orderToNotification,
    });

    const [orderPort, paymentPort, shippingPort, notificationPort] = await Promise.all([
      orderService.start(0),
      paymentProvider.start(0),
      shippingProvider.start(0),
      notificationService.start(0),
    ]);

    orderUrl = `http://127.0.0.1:${orderPort}`;
    paymentUrl = `http://127.0.0.1:${paymentPort}`;
    shippingUrl = `http://127.0.0.1:${shippingPort}`;
    notificationUrl = `http://127.0.0.1:${notificationPort}`;

    // Wire bidirectional webhook subscriptions
    // 1. Order Service -> Payment Provider (subscribes to order.created)
    orderService.dispatcher.registerSubscription({
      subscriberName: 'payment-provider',
      targetUrl: `${paymentUrl}/webhooks/orders`,
      secret: SECRETS.orderToPayment,
      events: ['order.created'],
    });

    // 2. Order Service -> Shipping Provider (subscribes to order.paid)
    orderService.dispatcher.registerSubscription({
      subscriberName: 'shipping-provider',
      targetUrl: `${shippingUrl}/webhooks/orders`,
      secret: SECRETS.orderToShipping,
      events: ['order.paid'],
    });

    // 3. Order Service -> Notification Service (subscribes to all order lifecycle events)
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

    // 4. Payment Provider -> Order Service (subscribes to payment.succeeded & payment.failed)
    paymentProvider.dispatcher.registerSubscription({
      subscriberName: 'order-service',
      targetUrl: `${orderUrl}/webhooks/inbound/payment`,
      secret: SECRETS.paymentToOrder,
      events: ['payment.succeeded', 'payment.failed'],
    });

    // 5. Shipping Provider -> Order Service (subscribes to shipment.created, in_transit, delivered)
    shippingProvider.dispatcher.registerSubscription({
      subscriberName: 'order-service',
      targetUrl: `${orderUrl}/webhooks/inbound/shipping`,
      secret: SECRETS.shippingToOrder,
      events: ['shipment.created', 'shipment.in_transit', 'shipment.delivered'],
    });
  });

  afterEach(async () => {
    await Promise.all([
      orderService.stop(),
      paymentProvider.stop(),
      shippingProvider.stop(),
      notificationService.stop(),
    ]);
  });

  it('1. Happy Path: completes full order lifecycle via bidirectional webhooks', async () => {
    const createRes = await fetch(`${orderUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust_alice',
        customerEmail: 'alice@example.com',
        shippingAddress: '742 Evergreen Terrace, Springfield',
        items: [
          { sku: 'MECH-KB-01', name: 'Mechanical Keyboard', quantity: 1, unitPrice: 149.99 },
          { sku: 'USB-C-CABLE', name: 'Coiled Aviator Cable', quantity: 2, unitPrice: 25.0 },
        ],
      }),
    });

    assert.equal(createRes.status, 201);
    const createdOrder = (await createRes.json()) as Order;
    assert.equal(createdOrder.totalAmount, 199.99);

    // Fetch updated order after webhook chain completes
    const orderRes = await fetch(`${orderUrl}/orders/${createdOrder.id}`);
    const finalOrder = (await orderRes.json()) as Order;

    assert.equal(finalOrder.status, 'DELIVERED');
    assert.ok(finalOrder.paymentIntentId?.startsWith('pi_'));
    assert.ok(finalOrder.trackingNumber?.startsWith('TRK-'));
    assert.equal(finalOrder.carrier, 'FastExpress');

    // Verify full state transition timeline
    const statuses = finalOrder.timeline.map((t) => t.status);
    assert.deepEqual(statuses, [
      'PENDING_PAYMENT',
      'PAID',
      'PROCESSING_SHIPMENT',
      'SHIPPED',
      'DELIVERED',
    ]);

    // Verify customer received all 4 lifecycle notifications via webhooks
    const notifTypes = notificationService.notifications
      .filter((n) => n.orderId === createdOrder.id)
      .map((n) => n.eventType);
    assert.deepEqual(notifTypes, [
      'order.created',
      'order.paid',
      'order.shipped',
      'order.delivered',
    ]);
  });

  it('2. Payment Failure Path: transitions order to PAYMENT_FAILED -> CANCELLED and skips shipping', async () => {
    const createRes = await fetch(`${orderUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust_bob',
        customerEmail: 'bob.decline@example.com', // Triggers simulated card decline
        shippingAddress: '10 Downing Street, London',
        items: [{ sku: 'GPU-5090', name: 'RTX 5090', quantity: 1, unitPrice: 1999.0 }],
      }),
    });

    assert.equal(createRes.status, 201);
    const order = (await createRes.json()) as Order;

    const orderRes = await fetch(`${orderUrl}/orders/${order.id}`);
    const finalOrder = (await orderRes.json()) as Order;

    assert.equal(finalOrder.status, 'CANCELLED');
    const statuses = finalOrder.timeline.map((t) => t.status);
    assert.deepEqual(statuses, ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED']);

    // Ensure no shipment was created
    assert.equal(shippingProvider.shipments.size, 0);

    // Verify customer received created, payment_failed, and cancelled notifications
    const notifTypes = notificationService.notifications
      .filter((n) => n.orderId === order.id)
      .map((n) => n.eventType);
    assert.deepEqual(notifTypes, ['order.created', 'order.payment_failed', 'order.cancelled']);
  });

  it('3. Security: rejects forged HMAC signature and expired timestamp replay attacks with 401', async () => {
    const payload = JSON.stringify({
      id: 'evt_forged_999',
      type: 'payment.succeeded',
      createdAt: new Date().toISOString(),
      source: 'attacker',
      data: { orderId: 'ord_fake', paymentIntentId: 'pi_fake', amount: 100 },
    });

    // Case A: Wrong secret
    const forgedSig = signWebhookPayload(payload, 'whsec_wrong_attacker_secret');
    const resForged = await fetch(`${orderUrl}/webhooks/inbound/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [WEBHOOK_SIGNATURE_HEADER]: forgedSig,
      },
      body: payload,
    });
    assert.equal(resForged.status, 401);
    const forgedBody = (await resForged.json()) as { reason: string };
    assert.equal(forgedBody.reason, 'signature_mismatch');

    // Case B: Replay attack (valid secret, but timestamp is 15 minutes old)
    const oldTimestamp = Date.now() - 15 * 60 * 1000;
    const expiredSig = signWebhookPayload(payload, SECRETS.paymentToOrder, oldTimestamp);
    const resExpired = await fetch(`${orderUrl}/webhooks/inbound/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [WEBHOOK_SIGNATURE_HEADER]: expiredSig,
      },
      body: payload,
    });
    assert.equal(resExpired.status, 401);
    const expiredBody = (await resExpired.json()) as { reason: string };
    assert.equal(expiredBody.reason, 'timestamp_expired');
  });

  it('4. Idempotency: ignores duplicate webhook deliveries with identical event ID', async () => {
    // Disable auto-payment so order stays in PENDING_PAYMENT
    paymentProvider.autoProcessPayments = false;

    const createRes = await fetch(`${orderUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust_charlie',
        customerEmail: 'charlie@example.com',
        shippingAddress: '1 Infinite Loop, Cupertino',
        items: [{ sku: 'HEADPHONES', name: 'Studio Headphones', quantity: 1, unitPrice: 299.0 }],
      }),
    });
    const order = (await createRes.json()) as Order;

    const duplicateEventPayload = JSON.stringify({
      id: 'evt_duplicate_test_001',
      type: 'payment.succeeded',
      createdAt: new Date().toISOString(),
      source: 'payment-provider',
      data: {
        orderId: order.id,
        paymentIntentId: 'pi_idempotent_1',
        amount: 299.0,
      },
    });

    const sig = signWebhookPayload(duplicateEventPayload, SECRETS.paymentToOrder);
    const headers = {
      'Content-Type': 'application/json',
      [WEBHOOK_ID_HEADER]: 'evt_duplicate_test_001',
      [WEBHOOK_EVENT_HEADER]: 'payment.succeeded',
      [WEBHOOK_TIMESTAMP_HEADER]: String(Date.now()),
      [WEBHOOK_SIGNATURE_HEADER]: sig,
    };

    // First delivery
    const firstRes = await fetch(`${orderUrl}/webhooks/inbound/payment`, {
      method: 'POST',
      headers,
      body: duplicateEventPayload,
    });
    const firstJson = (await firstRes.json()) as { duplicate: boolean };
    assert.equal(firstRes.status, 200);
    assert.equal(firstJson.duplicate, false);

    // Second delivery (exact same event ID)
    const secondRes = await fetch(`${orderUrl}/webhooks/inbound/payment`, {
      method: 'POST',
      headers,
      body: duplicateEventPayload,
    });
    const secondJson = (await secondRes.json()) as { duplicate: boolean };
    assert.equal(secondRes.status, 200);
    assert.equal(secondJson.duplicate, true);

    // Ensure PAID transition only occurred ONCE in timeline
    const finalOrder = orderService.orders.get(order.id)!;
    const paidEntries = finalOrder.timeline.filter((t) => t.status === 'PAID');
    assert.equal(paidEntries.length, 1);
  });

  it('5. Resilience: retries transient 503 failures with exponential backoff and recovers', async () => {
    // Configure Notification Service to fail the next 2 webhook requests with HTTP 503
    notificationService.failNextRequestsCount = 2;
    paymentProvider.autoProcessPayments = false;

    const createRes = await fetch(`${orderUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust_diana',
        customerEmail: 'diana@example.com',
        shippingAddress: '221B Baker Street, London',
        items: [{ sku: 'BOOK-01', name: 'Designing Data-Intensive Apps', quantity: 1, unitPrice: 45.0 }],
      }),
    });
    assert.equal(createRes.status, 201);

    // Inspect delivery record for notification-service
    const deliveries = orderService.dispatcher
      .getDeliveries()
      .filter((d) => d.subscriberName === 'notification-service');
    assert.equal(deliveries.length, 1);

    const delivery = deliveries[0];
    assert.equal(delivery.status, 'succeeded');
    assert.equal(delivery.attempts.length, 3);
    assert.equal(delivery.attempts[0].statusCode, 503);
    assert.equal(delivery.attempts[1].statusCode, 503);
    assert.equal(delivery.attempts[2].statusCode, 200);
  });

  it('6. Dead Letter Queue (DLQ) & Replay: moves exhausted deliveries to DLQ and replays on recovery', async () => {
    // Configure Notification Service to fail 5 times (exceeding maxAttempts = 3)
    notificationService.failNextRequestsCount = 5;
    paymentProvider.autoProcessPayments = false;

    await fetch(`${orderUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust_evan',
        customerEmail: 'evan@example.com',
        shippingAddress: '1600 Amphitheatre Pkwy, Mountain View',
        items: [{ sku: 'MONITOR-4K', name: '27" 4K Monitor', quantity: 1, unitPrice: 399.0 }],
      }),
    });

    // Verify delivery landed in Dead Letter Queue after 3 failed attempts
    const dlqBefore = orderService.dispatcher.getDeadLetterQueue();
    assert.equal(dlqBefore.length, 1);
    assert.equal(dlqBefore[0].status, 'dead_letter');
    assert.equal(dlqBefore[0].attempts.length, 3);

    // Fix the downstream outage and replay the DLQ item via API
    notificationService.failNextRequestsCount = 0;
    const replayRes = await fetch(`${orderUrl}/webhooks/dlq/${dlqBefore[0].deliveryId}/replay`, {
      method: 'POST',
    });
    assert.equal(replayRes.status, 200);
    const replayedRecord = (await replayRes.json()) as { status: string; attempts: unknown[] };
    assert.equal(replayedRecord.status, 'succeeded');
    assert.equal(replayedRecord.attempts.length, 4);

    // Verify DLQ is now empty
    assert.equal(orderService.dispatcher.getDeadLetterQueue().length, 0);
  });
});
