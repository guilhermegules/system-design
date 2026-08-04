import { OrderEntity } from '@infrastructure/persistence/order.entity';
import { Order, OrderItem } from '@domain/order';

describe('OrderEntity', () => {
  const items: OrderItem[] = [{ productId: 'p1', quantity: 2, unitPrice: 10 }];
  const order = new Order(
    'order-1',
    'customer-1',
    'PENDING',
    items,
    20,
    'USD',
    null,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );

  it('maps from domain to entity', () => {
    const entity = OrderEntity.fromDomain(order);

    expect(entity.id).toBe('order-1');
    expect(entity.customerId).toBe('customer-1');
    expect(entity.status).toBe('PENDING');
    expect(entity.items).toEqual(items);
    expect(entity.totalAmount).toBe(20);
    expect(entity.currency).toBe('USD');
    expect(entity.simulate).toBeNull();
    expect(entity.createdAt).toEqual(order.createdAt);
    expect(entity.updatedAt).toEqual(order.updatedAt);
  });

  it('maps from entity back to domain', () => {
    const entity = OrderEntity.fromDomain(order);

    expect(entity.toDomain()).toEqual(order);
  });
});
