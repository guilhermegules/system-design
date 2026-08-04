import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { buildEnvelope } from '../../domain/event-envelope';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { OutboxRepository } from '../../domain/ports/outbox-repository';

const POLL_INTERVAL_MS = 2000;

@Injectable()
export class OutboxPoller {
  private readonly logger = new Logger(OutboxPoller.name);

  constructor(
    @Inject(OutboxRepository) private readonly outbox: OutboxRepository,
    @Inject(EventPublisher) private readonly publisher: EventPublisher,
  ) {}

  @Interval(POLL_INTERVAL_MS)
  async poll(): Promise<void> {
    const events = await this.outbox.fetchPending();

    for (const event of events) {
      const envelope = buildEnvelope({
        eventId: event.eventId,
        correlationId: event.correlationId,
        eventType: event.eventType,
        occurredAt: event.createdAt,
        payload: event.payload,
      });

      try {
        await this.publisher.publish(envelope);
        await this.outbox.markSent(event.id, new Date());
      } catch (err) {
        this.logger.error(
          `failed to publish ${event.eventType} (${event.id}): ${(err as Error).message}`,
        );
      }
    }
  }
}
