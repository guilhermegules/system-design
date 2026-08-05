import { Order, OrderItem } from '@domain/order';

describe('Order', () => {
  const items: OrderItem[] = [{ productId: 'p1', quantity: 2, unitPrice: 10 }];

  describe('create', () => {
    it('creates a PENDING order with the provided fields', () => {
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        totalAmount: 20,
        currency: 'USD',
        simulate: null,
      });

      expect(order.id).toBe('order-1');
      expect(order.customerId).toBe('customer-1');
      expect(order.status).toBe('PENDING');
      expect(order.items).toEqual(items);
      expect(order.totalAmount).toBe(20);
      expect(order.currency).toBe('USD');
      expect(order.simulate).toBeNull();
    });

    it('sets createdAt and updatedAt to the same moment', () => {
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        totalAmount: 20,
        currency: 'USD',
        simulate: null,
      });

      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toEqual(order.createdAt);
    });
  });
});
