export class CreateAccount {
  constructor(public accountId: string, public initialBalance: number) {}
}

export class DepositMoney {
  constructor(public accountId: string, public amount: number) {}
}

export class WithdrawMoney {
  constructor(public accountId: string, public amount: number) {}
}
