import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signWebhookPayload, verifyWebhookSignature } from './signature.ts';
import { IdempotencyStore } from './idempotency.ts';

describe('webhook-kit: HMAC-SHA256 Signature & Replay Protection', () => {
  const secret = 'whsec_test_secret_123';
  const rawBody = JSON.stringify({ id: 'evt_1', type: 'order.created', data: { orderId: 'ord_1' } });

  it('signs and verifies a valid payload', () => {
    const now = 1700000000000;
    const header = signWebhookPayload(rawBody, secret, now);
    const result = verifyWebhookSignature(rawBody, header, secret, 300_000, now + 5000);
    assert.equal(result.valid, true);
  });

  it('rejects a tampered body with signature_mismatch', () => {
    const now = 1700000000000;
    const header = signWebhookPayload(rawBody, secret, now);
    const tamperedBody = JSON.stringify({ id: 'evt_1', type: 'order.created', data: { orderId: 'ord_HACKED' } });
    const result = verifyWebhookSignature(tamperedBody, header, secret, 300_000, now + 1000);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'signature_mismatch');
  });

  it('rejects an expired timestamp to prevent replay attacks', () => {
    const timestamp = 1700000000000;
    const header = signWebhookPayload(rawBody, secret, timestamp);
    const tenMinutesLater = timestamp + 10 * 60 * 1000;
    const result = verifyWebhookSignature(rawBody, header, secret, 5 * 60 * 1000, tenMinutesLater);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'timestamp_expired');
  });

  it('tracks idempotency keys accurately', () => {
    const store = new IdempotencyStore();
    assert.equal(store.hasProcessed('evt_100'), false);
    store.markProcessed('evt_100', 'payment.succeeded');
    assert.equal(store.hasProcessed('evt_100'), true);
    assert.equal(store.getRecord('evt_100')?.eventType, 'payment.succeeded');
  });
});
