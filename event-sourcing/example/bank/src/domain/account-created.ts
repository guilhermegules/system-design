import { DomainEvent } from "./domain-event";

export class AccountCreated implements DomainEvent {
  type: string = "AccountCreated";
  occurredAt = new Date();

  constructor(public aggregateId: string, public initialBalance: number) {}
}
