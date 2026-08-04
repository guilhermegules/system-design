import { OutboxEvent } from '@domain/outbox-event';

export interface OutboxRepository {
  enqueue(eventType: string, correlationId: string, payload: unknown): Promise<void>;
  fetchPending(limit?: number): Promise<OutboxEvent[]>;
  markSent(id: string, sentAt: Date): Promise<void>;
}

export const OutboxRepository = 'OutboxRepository';
