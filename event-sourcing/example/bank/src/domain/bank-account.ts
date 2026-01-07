import { AccountCreated } from "./account-created";
import { CreateAccount } from "./commands";
import { DomainEvent } from "./domain-event";
import { MoneyDeposited } from "./money-deposited";
import { MoneyWithdrawn } from "./money-withdrawn";

export class BankAccount {
  private balance = 0;
  private id!: string;

  // Rebuild state by replaying events
  static fromEvents(events: DomainEvent[]): BankAccount {
    const account = new BankAccount();
    for (const event of events) {
      account.apply(event);
    }
    return account;
  }

  create(id: string, initialBalance: number): DomainEvent[] {
    if (initialBalance < 0) {
      throw new Error("Initial balance cannot be negative");
    }

    return [new AccountCreated(id, initialBalance)];
  }

  deposit(amount: number): DomainEvent[] {
    if (amount <= 0) {
      throw new Error("Deposit must be positive");
    }

    return [new MoneyDeposited(this.id, amount)];
  }

  withdraw(amount: number): DomainEvent[] {
    if (amount <= 0) {
      throw new Error("Withdraw must be positive");
    }

    if (this.balance < amount) {
      throw new Error("Insufficient funds");
    }

    return [new MoneyWithdrawn(this.id, amount)];
  }

  getBalance() {
    return this.balance;
  }

  private apply(event: DomainEvent) {
    switch (event.type) {
      case "AccountCreated": {
        const e = event as AccountCreated;
        this.id = e.aggregateId;
        this.balance = e.initialBalance;
        break;
      }
      case "MoneyDeposited": {
        const e = event as MoneyDeposited;
        this.balance += e.amount;
        break;
      }
      case "MoneyWithdrawn": {
        const e = event as MoneyWithdrawn;
        this.balance -= e.amount;
        break;
      }
    }
  }
}
