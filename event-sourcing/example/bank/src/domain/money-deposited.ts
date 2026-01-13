import { DomainEvent } from "./domain-event";

export class MoneyDeposited implements DomainEvent {
  type = "MoneyDeposited";
  occurredAt = new Date();

  constructor(public aggregateId: string, public amount: number) {}
}
