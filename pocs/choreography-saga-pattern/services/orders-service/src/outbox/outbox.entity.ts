import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OutboxStatus = 'PENDING' | 'SENT';

@Entity('outbox')
export class OutboxEvent {
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
}
