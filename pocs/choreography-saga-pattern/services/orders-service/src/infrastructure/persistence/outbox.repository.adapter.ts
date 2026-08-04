import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { OutboxEvent } from '@domain/outbox-event';
import { OutboxRepository } from '@domain/ports/outbox-repository';
import { OutboxEntity } from './outbox.entity';

@Injectable()
export class OutboxRepositoryAdapter implements OutboxRepository {
  constructor(
    @InjectRepository(OutboxEntity)
    private readonly repo: Repository<OutboxEntity>,
  ) {}

  async enqueue(eventType: string, correlationId: string, payload: unknown): Promise<void> {
    const row = this.repo.create({
      eventId: randomUUID(),
      eventType,
      correlationId,
      payload: payload as Record<string, unknown>,
      status: 'PENDING',
    });
    await this.repo.save(row);
  }

  async fetchPending(limit = 50): Promise<OutboxEvent[]> {
    const rows = await this.repo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: limit,
    });
    return rows.map((row) => row.toDomain());
  }

  async markSent(id: string, sentAt: Date): Promise<void> {
    await this.repo.update(id, { status: 'SENT', sentAt });
  }
}
