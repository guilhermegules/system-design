import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEnvelope } from '../events/event-envelope';
import { InboxEvent } from './inbox.entity';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(
    @InjectRepository(InboxEvent)
    private readonly repo: Repository<InboxEvent>,
  ) {}

  async process(envelope: EventEnvelope, handler: () => Promise<void>): Promise<'processed' | 'duplicate'> {
    const exists = await this.repo.findOne({ where: { eventId: envelope.eventId } });
    if (exists) {
      this.logger.debug(`duplicate event ignored: ${envelope.eventId}`);
      return 'duplicate';
    }

    await handler();

    await this.repo.save(
      this.repo.create({
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        correlationId: envelope.correlationId,
        payload: envelope.payload as Record<string, unknown>,
      }),
    );

    return 'processed';
  }
}
