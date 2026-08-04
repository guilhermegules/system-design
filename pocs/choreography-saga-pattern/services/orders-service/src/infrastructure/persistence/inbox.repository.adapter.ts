import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEnvelope } from '../../domain/event-envelope';
import { InboxRepository } from '../../domain/ports/inbox-repository';
import { InboxEntity } from './inbox.entity';

@Injectable()
export class InboxRepositoryAdapter implements InboxRepository {
  constructor(
    @InjectRepository(InboxEntity)
    private readonly repo: Repository<InboxEntity>,
  ) {}

  async exists(eventId: string): Promise<boolean> {
    return this.repo.exists({ where: { eventId } });
  }

  async markProcessed(envelope: EventEnvelope): Promise<void> {
    await this.repo.save(
      this.repo.create({
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        correlationId: envelope.correlationId,
        payload: envelope.payload as Record<string, unknown>,
      }),
    );
  }
}
