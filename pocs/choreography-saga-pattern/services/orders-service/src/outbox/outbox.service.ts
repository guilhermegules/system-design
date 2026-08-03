import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutboxEvent } from './outbox.entity';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly repo: Repository<OutboxEvent>,
  ) {}

  async enqueue(eventType: string, correlationId: string, payload: unknown): Promise<OutboxEvent> {
    const row = this.repo.create({
      eventId: randomUUID(),
      eventType,
      correlationId,
      payload: payload as Record<string, unknown>,
      status: 'PENDING',
    });
    return this.repo.save(row);
  }

  async fetchPending(limit = 50): Promise<OutboxEvent[]> {
    return this.repo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markSent(id: string, sentAt: Date): Promise<void> {
    await this.repo.update(id, { status: 'SENT', sentAt });
  }
}
