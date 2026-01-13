import { BankAccount } from "../domain/bank-account";
import { CreateAccount, DepositMoney, WithdrawMoney } from "../domain/commands";
import { DomainEvent } from "../domain/domain-event";
import { InMemoryEventStore } from "../infra/event-store";

export class BankAccountCommandHandler {
  constructor(private readonly eventStore: InMemoryEventStore) {}

  handle(command: CreateAccount | DepositMoney | WithdrawMoney) {
    const events = this.eventStore.getByAggregateId(command.accountId);

    let account = BankAccount.fromEvents(events);

    let newEvents: DomainEvent[] = [];

    if (command instanceof CreateAccount) {
      newEvents = account.create(command.accountId, command.initialBalance);
    }

    if (command instanceof DepositMoney) {
      newEvents = account.deposit(command.amount);
    }

    if (command instanceof WithdrawMoney) {
      newEvents = account.withdraw(command.amount);
    }

    this.eventStore.append(newEvents);
    account = BankAccount.fromEvents([...events, ...newEvents]);
    console.log("final balance", account.getBalance());
  }
}
