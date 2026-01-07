import { DomainEvent } from "./domain-event";

export class MoneyWithdrawn implements DomainEvent {
  type = "MoneyWithdrawn";
  occurredAt = new Date();

  constructor(public aggregateId: string, public amount: number) {}
}
