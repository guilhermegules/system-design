import { BankAccountCommandHandler } from "./app/command-handlers";
import { CreateAccount, DepositMoney, WithdrawMoney } from "./domain/commands";
import { InMemoryEventStore } from "./infra/event-store";

const eventStore = new InMemoryEventStore();
const handler = new BankAccountCommandHandler(eventStore);

const accountId = "acc-123";

handler.handle(new CreateAccount(accountId, 100));
handler.handle(new DepositMoney(accountId, 50));
handler.handle(new WithdrawMoney(accountId, 30));

console.log(eventStore.getByAggregateId(accountId));
