export interface PaymentMethod {
  pay(amount: number): void;
}

export interface RefundablePayment extends PaymentMethod {
  refund(amount: number): void;
}

export class CreditCardPayment implements RefundablePayment {
  pay(amount: number): void {
    console.log(`Paid ${amount} with credit card`);
  }

  refund(amount: number): void {
    console.log(`Refunded ${amount} to credit card`);
  }
}

export class CashPayment implements PaymentMethod {
  pay(amount: number): void {
    console.log(`Paid ${amount} in cash`);
  }
}
