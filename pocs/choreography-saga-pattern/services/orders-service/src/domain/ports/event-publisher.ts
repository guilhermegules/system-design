import { EventEnvelope } from '../event-envelope';

export abstract class EventPublisher {
  abstract publish(envelope: EventEnvelope): Promise<void>;
}
