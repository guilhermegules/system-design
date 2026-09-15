export type OutboxStatus = 'PENDING' | 'SENT';

export class OutboxEvent {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly eventType: string,
    public readonly correlationId: string,
    public readonly payload: Record<string, unknown>,
    public readonly status: OutboxStatus,
    public readonly createdAt: Date,
    public readonly sentAt: Date | null,
  ) {}
}
