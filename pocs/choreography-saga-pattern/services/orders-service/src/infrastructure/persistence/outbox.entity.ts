import { OutboxEvent, OutboxStatus } from '@domain/outbox-event';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox')
export class OutboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  eventId: string;

  @Column()
  eventType: string;

  @Column('uuid')
  correlationId: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OutboxStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  static fromDomain(event: OutboxEvent): OutboxEntity {
    const entity = new OutboxEntity();
    entity.id = event.id;
    entity.eventId = event.eventId;
    entity.eventType = event.eventType;
    entity.correlationId = event.correlationId;
    entity.payload = event.payload;
    entity.status = event.status;
    entity.createdAt = event.createdAt;
    entity.sentAt = event.sentAt;
    return entity;
  }

  toDomain(): OutboxEvent {
    return new OutboxEvent(
      this.id,
      this.eventId,
      this.eventType,
      this.correlationId,
      this.payload,
      this.status,
      this.createdAt,
      this.sentAt,
    );
  }
}
