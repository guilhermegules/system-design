export interface DomainEvent {
  aggregateId: string;
  type: string;
  occurredAt: Date;
}
