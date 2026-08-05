import { EventEnvelope } from '@domain/event-envelope';

export interface EventPublisher {
  publish(envelope: EventEnvelope): Promise<void>;
}

export const EventPublisher = 'EventPublisher';
