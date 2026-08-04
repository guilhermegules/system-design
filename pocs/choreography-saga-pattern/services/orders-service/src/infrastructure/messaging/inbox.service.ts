import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EventEnvelope } from '@domain/event-envelope';
import { InboxRepository } from '@domain/ports/inbox-repository';

export type InboxProcessResult = 'processed' | 'duplicate';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(@Inject(InboxRepository) private readonly repo: InboxRepository) {}

  async process(envelope: EventEnvelope, handler: () => Promise<void>): Promise<InboxProcessResult> {
    const exists = await this.repo.exists(envelope.eventId);
    if (exists) {
      this.logger.debug(`duplicate event ignored: ${envelope.eventId}`);
      return 'duplicate';
    }

    await handler();

    await this.repo.markProcessed(envelope);

    return 'processed';
  }
}
