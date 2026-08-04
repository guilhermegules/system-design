import { EventEnvelope } from '../event-envelope';

export interface EventPublisher {
  publish(envelope: EventEnvelope): Promise<void>;
}

export const EventPublisher = 'EventPublisher';
