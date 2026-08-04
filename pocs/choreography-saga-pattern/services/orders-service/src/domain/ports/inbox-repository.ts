import { EventEnvelope } from '../event-envelope';

export abstract class InboxRepository {
  abstract exists(eventId: string): Promise<boolean>;
  abstract markProcessed(envelope: EventEnvelope): Promise<void>;
}
