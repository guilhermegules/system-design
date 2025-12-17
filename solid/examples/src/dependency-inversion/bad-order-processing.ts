class BadMySQLOrderRepository {
  save(order: BadOrder): void {
    console.log("Order saved in MySQL", order);
  }
}

class BadEmailService {
  sendConfirmation(orderId: string): void {
    console.log("Confirmation email sent for", orderId);
  }
}

type BadOrder = { id: string; total: number };

class BadOrderService {
  private repository = new BadMySQLOrderRepository();
  private notifier = new BadEmailService();

  placeOrder(order: BadOrder): void {
    this.repository.save(order);
    this.notifier.sendConfirmation(order.id);
  }
}
