import { EventEnvelope } from '@domain/event-envelope';

export interface InboxRepository {
  exists(eventId: string): Promise<boolean>;
  markProcessed(envelope: EventEnvelope): Promise<void>;
}

export const InboxRepository = 'InboxRepository';
