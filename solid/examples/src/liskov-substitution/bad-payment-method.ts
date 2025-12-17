class BadPaymentMethod {
  pay(amount: number): void {
    throw new Error("Not implemented");
  }

  refund(amount: number): void {
    throw new Error("Not implemented");
  }
}

class BadCreditCardPayment extends BadPaymentMethod {
  pay(amount: number): void {
    console.log(`Paid ${amount} with credit card`);
  }

  refund(amount: number): void {
    console.log(`Refunded ${amount} to credit card`);
  }
}

class BadCashPayment extends BadPaymentMethod {
  pay(amount: number): void {
    console.log(`Paid ${amount} in cash`);
  }

  refund(amount: number): void {
    // ❌ Cash cannot be refunded automatically
    throw new Error("Cash payments cannot be refunded");
  }
}

/**
Why this violates LSP

CashPayment cannot safely replace PaymentMethod

The base class promises refund() works

Subclass changes expected behavior (throws)
 */
// function processRefund(payment: PaymentMethod, amount: number): void {
//   payment.refund(amount); // 💥 CashPayment breaks here
// }
