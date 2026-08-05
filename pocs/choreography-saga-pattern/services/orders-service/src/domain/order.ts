export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly status: OrderStatus,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly currency: string,
    public readonly simulate: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: number;
    currency: string;
    simulate: string | null;
  }): Order {
    const now = new Date();
    return new Order(
      input.id,
      input.customerId,
      'PENDING',
      input.items,
      input.totalAmount,
      input.currency,
      input.simulate,
      now,
      now,
    );
  }
}
