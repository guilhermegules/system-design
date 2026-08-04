import { OutboxEvent } from '../outbox-event';

export abstract class OutboxRepository {
  abstract enqueue(eventType: string, correlationId: string, payload: unknown): Promise<void>;
  abstract fetchPending(limit?: number): Promise<OutboxEvent[]>;
  abstract markSent(id: string, sentAt: Date): Promise<void>;
}
