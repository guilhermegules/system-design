import { OrderRepositoryAdapter } from '@infrastructure/persistence/order.repository.adapter';
import { OrderEntity } from '@infrastructure/persistence/order.entity';
import { Order, OrderItem } from '@domain/order';

describe('OrderRepositoryAdapter', () => {
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

  let repo: { save: jest.Mock; findOne: jest.Mock; find: jest.Mock; update: jest.Mock };
  let adapter: OrderRepositoryAdapter;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };
    adapter = new OrderRepositoryAdapter(repo as never);
  });

  it('saves an order', async () => {
    const entity = OrderEntity.fromDomain(order);
    repo.save.mockResolvedValue(entity);

    await expect(adapter.save(order)).resolves.toEqual(order);
    expect(repo.save).toHaveBeenCalledWith(entity);
  });

  it('finds an order by id', async () => {
    const entity = OrderEntity.fromDomain(order);
    repo.findOne.mockResolvedValue(entity);

    await expect(adapter.findById('order-1')).resolves.toEqual(order);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'order-1' } });
  });

  it('returns null when the order is not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(adapter.findById('missing')).resolves.toBeNull();
  });

  it('lists orders by customer ordered by createdAt desc', async () => {
    const entity = OrderEntity.fromDomain(order);
    repo.find.mockResolvedValue([entity]);

    await expect(adapter.findByCustomer('customer-1')).resolves.toEqual([order]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      order: { createdAt: 'DESC' },
    });
  });

  it('completes a pending order', async () => {
    repo.update.mockResolvedValue({ affected: 1 });

    await expect(adapter.completeIfPending('order-1')).resolves.toBe(true);
    expect(repo.update).toHaveBeenCalledWith(
      { id: 'order-1', status: 'PENDING' },
      { status: 'COMPLETED' },
    );
  });

  it('reports when complete does not match a pending order', async () => {
    repo.update.mockResolvedValue({ affected: 0 });

    await expect(adapter.completeIfPending('order-1')).resolves.toBe(false);
  });

  it('reports when the update result has no affected count', async () => {
    repo.update.mockResolvedValue({});

    await expect(adapter.completeIfPending('order-1')).resolves.toBe(false);
  });

  it('cancels a pending order', async () => {
    repo.update.mockResolvedValue({ affected: 1 });

    await expect(adapter.cancelIfPending('order-1')).resolves.toBe(true);
    expect(repo.update).toHaveBeenCalledWith(
      { id: 'order-1', status: 'PENDING' },
      { status: 'CANCELLED' },
    );
  });

  it('reports when cancel does not match a pending order', async () => {
    repo.update.mockResolvedValue({ affected: 0 });

    await expect(adapter.cancelIfPending('order-1')).resolves.toBe(false);
  });

  it('reports when the cancel result has no affected count', async () => {
    repo.update.mockResolvedValue({});

    await expect(adapter.cancelIfPending('order-1')).resolves.toBe(false);
  });
});
