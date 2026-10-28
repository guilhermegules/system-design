import { createHmac, timingSafeEqual } from 'node:crypto';

export const WEBHOOK_SIGNATURE_HEADER = 'x-webhook-signature';
export const WEBHOOK_ID_HEADER = 'x-webhook-id';
export const WEBHOOK_EVENT_HEADER = 'x-webhook-event';
export const WEBHOOK_TIMESTAMP_HEADER = 'x-webhook-timestamp';

export interface SignatureVerificationResult {
  valid: boolean;
  reason?: 'missing_header' | 'invalid_format' | 'timestamp_expired' | 'signature_mismatch';
}

/**
 * Generates an Stripe-style HMAC-SHA256 webhook signature header:
 * Format: `t=<unix_timestamp_ms>,v1=<hex_hmac>`
 * The signed payload is `<timestamp>.<raw_json_body>` to bind the timestamp to the body
 * and prevent replay attacks.
 */
export function signWebhookPayload(
  rawBody: string,
  secret: string,
  timestampMs: number = Date.now(),
): string {
  const signedPayload = `${timestampMs}.${rawBody}`;
  const hmac = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
  return `t=${timestampMs},v1=${hmac}`;
}

/**
 * Verifies the `X-Webhook-Signature` header using constant-time comparison
 * (`crypto.timingSafeEqual`) and checks timestamp tolerance to prevent replay attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
  toleranceMs: number = 5 * 60 * 1000, // 5 minutes default tolerance
  nowMs: number = Date.now(),
): SignatureVerificationResult {
  if (!signatureHeader) {
    return { valid: false, reason: 'missing_header' };
  }

  const parts = signatureHeader.split(',');
  let timestampStr: string | undefined;
  let signatureHex: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestampStr = value;
    if (key === 'v1') signatureHex = value;
  }

  if (!timestampStr || !signatureHex) {
    return { valid: false, reason: 'invalid_format' };
  }

  const timestampMs = Number(timestampStr);
  if (Number.isNaN(timestampMs)) {
    return { valid: false, reason: 'invalid_format' };
  }

  if (Math.abs(nowMs - timestampMs) > toleranceMs) {
    return { valid: false, reason: 'timestamp_expired' };
  }

  const expectedSignedPayload = `${timestampMs}.${rawBody}`;
  const expectedHmac = createHmac('sha256', secret)
    .update(expectedSignedPayload, 'utf8')
    .digest('hex');

  const actualBuffer = Buffer.from(signatureHex, 'hex');
  const expectedBuffer = Buffer.from(expectedHmac, 'hex');

  if (actualBuffer.length !== expectedBuffer.length) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  const isMatch = timingSafeEqual(actualBuffer, expectedBuffer);
  if (!isMatch) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  return { valid: true };
}
