import { randomUUID } from 'node:crypto';
import {
  signWebhookPayload,
  WEBHOOK_EVENT_HEADER,
  WEBHOOK_ID_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
} from './signature.ts';
import type {
  DeliveryAttempt,
  OrderEventType,
  WebhookDeliveryRecord,
  WebhookEvent,
  WebhookSubscription,
} from './types.ts';

export interface DispatcherOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  requestTimeoutMs?: number;
  onDeliveryUpdate?: (record: WebhookDeliveryRecord) => void;
}

/**
 * WebhookDispatcher manages subscriber registrations, signs outgoing payloads with HMAC-SHA256,
 * delivers events asynchronously, retries failed deliveries with exponential backoff,
 * and moves exhausted deliveries into a Dead Letter Queue (DLQ).
 */
export class WebhookDispatcher {
  private readonly subscriptions = new Map<string, WebhookSubscription>();
  private readonly deliveries = new Map<string, WebhookDeliveryRecord>();
  private readonly deadLetterQueue = new Map<string, WebhookDeliveryRecord>();

  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly requestTimeoutMs: number;
  private readonly onDeliveryUpdate?: (record: WebhookDeliveryRecord) => void;

  constructor(options: DispatcherOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 150;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 3000;
    this.onDeliveryUpdate = options.onDeliveryUpdate;
  }

  public registerSubscription(
    input: Omit<WebhookSubscription, 'id' | 'createdAt' | 'active'> & {
      id?: string;
      active?: boolean;
    },
  ): WebhookSubscription {
    const subscription: WebhookSubscription = {
      id: input.id ?? `sub_${randomUUID().slice(0, 8)}`,
      subscriberName: input.subscriberName,
      targetUrl: input.targetUrl,
      secret: input.secret,
      events: input.events,
      active: input.active ?? true,
      createdAt: new Date().toISOString(),
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  public removeSubscription(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  public listSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getDeliveries(): WebhookDeliveryRecord[] {
    return Array.from(this.deliveries.values());
  }

  public getDeadLetterQueue(): WebhookDeliveryRecord[] {
    return Array.from(this.deadLetterQueue.values());
  }

  /**
   * Dispatches an event to all active subscribers interested in `event.type`.
   * Returns a promise that resolves with all delivery records once attempts finish.
   */
  public async dispatch<T>(
    eventType: OrderEventType,
    source: string,
    data: T,
    customEventId?: string,
  ): Promise<WebhookDeliveryRecord[]> {
    const event: WebhookEvent<T> = {
      id: customEventId ?? `evt_${randomUUID().slice(0, 12)}`,
      type: eventType,
      createdAt: new Date().toISOString(),
      source,
      data,
    };

    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.active && sub.events.includes(eventType),
    );

    const tasks = matchingSubscriptions.map((sub) => this.deliverToSubscription(sub, event));
    return Promise.all(tasks);
  }

  /**
   * Replays a single delivery from the Dead Letter Queue or deliveries map.
   */
  public async replayDelivery(deliveryId: string): Promise<WebhookDeliveryRecord | undefined> {
    const record = this.deliveries.get(deliveryId);
    if (!record) return undefined;

    const sub = this.subscriptions.get(record.subscriptionId);
    if (!sub) return undefined;

    this.deadLetterQueue.delete(deliveryId);
    return this.deliverToSubscription(sub, record.payload, record);
  }

  private async deliverToSubscription(
    subscription: WebhookSubscription,
    event: WebhookEvent,
    existingRecord?: WebhookDeliveryRecord,
  ): Promise<WebhookDeliveryRecord> {
    const record: WebhookDeliveryRecord = existingRecord ?? {
      deliveryId: `dlv_${randomUUID().slice(0, 10)}`,
      eventId: event.id,
      eventType: event.type,
      subscriptionId: subscription.id,
      subscriberName: subscription.subscriberName,
      targetUrl: subscription.targetUrl,
      status: 'pending',
      attempts: [],
      payload: event,
      createdAt: new Date().toISOString(),
    };

    this.deliveries.set(record.deliveryId, record);
    const rawBody = JSON.stringify(event);

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const startTime = Date.now();
      const timestampMs = Date.now();
      const signature = signWebhookPayload(rawBody, subscription.secret, timestampMs);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

        const response = await fetch(subscription.targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [WEBHOOK_ID_HEADER]: event.id,
            [WEBHOOK_EVENT_HEADER]: event.type,
            [WEBHOOK_TIMESTAMP_HEADER]: String(timestampMs),
            [WEBHOOK_SIGNATURE_HEADER]: signature,
          },
          body: rawBody,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const durationMs = Date.now() - startTime;

        const attemptEntry: DeliveryAttempt = {
          attemptNumber: record.attempts.length + 1,
          timestamp: new Date().toISOString(),
          statusCode: response.status,
          durationMs,
        };

        if (response.ok) {
          record.attempts.push(attemptEntry);
          record.status = 'succeeded';
          record.completedAt = new Date().toISOString();
          this.onDeliveryUpdate?.(record);
          return record;
        }

        const errorBody = await response.text().catch(() => '');
        attemptEntry.error = `HTTP ${response.status}: ${errorBody.slice(0, 120)}`;
        record.attempts.push(attemptEntry);
      } catch (err) {
        const durationMs = Date.now() - startTime;
        record.attempts.push({
          attemptNumber: record.attempts.length + 1,
          timestamp: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
          durationMs,
        });
      }

      if (attempt < this.maxAttempts) {
        record.status = 'retrying';
        this.onDeliveryUpdate?.(record);
        const backoffMs = this.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    record.status = 'dead_letter';
    record.completedAt = new Date().toISOString();
    this.deadLetterQueue.set(record.deliveryId, record);
    this.onDeliveryUpdate?.(record);
    return record;
  }
}
