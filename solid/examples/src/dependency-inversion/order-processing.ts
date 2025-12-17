interface OrderRepository {
  save(order: Order): void;
}

interface NotificationService {
  sendConfirmation(orderId: string): void;
}

type Order = { id: string; total: number };

export class MySQLOrderRepository implements OrderRepository {
  save(order: Order): void {
    console.log("Order saved in MySQL", order);
  }
}

export class MongoOrderRepository implements OrderRepository {
  save(order: Order): void {
    console.log("Order saved in MongoDB", order);
  }
}

export class EmailNotificationService implements NotificationService {
  sendConfirmation(orderId: string): void {
    console.log("Email confirmation sent for", orderId);
  }
}

export class SmsNotificationService implements NotificationService {
  sendConfirmation(orderId: string): void {
    console.log("SMS confirmation sent for", orderId);
  }
}

export class OrderService {
  constructor(
    private repository: OrderRepository,
    private notifier: NotificationService
  ) {}

  placeOrder(order: Order): void {
    this.repository.save(order);
    this.notifier.sendConfirmation(order.id);
  }
}
