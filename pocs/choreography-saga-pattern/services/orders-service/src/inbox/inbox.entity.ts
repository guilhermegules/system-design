import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('inbox_events')
export class InboxEvent {
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
}
