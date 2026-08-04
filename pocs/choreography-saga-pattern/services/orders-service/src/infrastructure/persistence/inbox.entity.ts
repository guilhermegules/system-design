import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { InboxEvent } from '../../domain/inbox-event';

@Entity('inbox_events')
export class InboxEntity {
  @PrimaryColumn('uuid')
  eventId: string;

  @Column()
  eventType: string;

  @Column('uuid')
  correlationId: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @CreateDateColumn()
  processedAt: Date;

  static fromDomain(event: InboxEvent): InboxEntity {
    const entity = new InboxEntity();
    entity.eventId = event.eventId;
    entity.eventType = event.eventType;
    entity.correlationId = event.correlationId;
    entity.payload = event.payload;
    entity.processedAt = event.processedAt;
    return entity;
  }
}
