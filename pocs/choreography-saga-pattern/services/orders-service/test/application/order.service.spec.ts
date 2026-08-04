import { OrderService } from '@application/order.service';
import { UnitOfWorkRunner } from '@application/ports/unit-of-work';
import { Order, OrderItem } from '@domain/order';
import { TOPICS } from '@domain/event-topics';
import { OrderCache } from '@domain/ports/order-cache';
import { OrderRepository } from '@domain/ports/order-repository';
import { OutboxRepository } from '@domain/ports/outbox-repository';
import { Metrics } from '@domain/ports/metrics';

describe('OrderService', () => {
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

  let orders: jest.Mocked<OrderRepository>;
  let outbox: jest.Mocked<OutboxRepository>;
  let uow: { run: jest.Mock };
  let cache: jest.Mocked<OrderCache>;
  let metrics: jest.Mocked<Metrics>;
  let service: OrderService;

  beforeEach(() => {
    orders = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCustomer: jest.fn(),
      completeIfPending: jest.fn(),
      cancelIfPending: jest.fn(),
    };
    outbox = {
      enqueue: jest.fn(),
      fetchPending: jest.fn(),
      markSent: jest.fn(),
    };
    uow = {
      run: jest.fn((work) => work({ orderRepository: orders, outboxRepository: outbox })),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    metrics = {
      incOrdersCreated: jest.fn(),
      incOrdersCompleted: jest.fn(),
      incOrdersCancelled: jest.fn(),
    };

    service = new OrderService(
      orders,
      outbox,
      uow as unknown as UnitOfWorkRunner,
      cache,
      metrics,
    );
  });

  describe('createOrder', () => {
    it('saves the order and enqueues order.created within a unit of work', async () => {
      const result = await service.createOrder({ customerId: 'customer-1', items });

      expect(result.status).toBe('PENDING');
      expect(result.currency).toBe('USD');
      expect(result.totalAmount).toBe(20);
      expect(uow.run).toHaveBeenCalledTimes(1);
      expect(orders.save).toHaveBeenCalledWith(result);
      expect(outbox.enqueue).toHaveBeenCalledWith(TOPICS.orderCreated, result.id, {
        orderId: result.id,
        customerId: 'customer-1',
        items,
        totalAmount: 20,
        currency: 'USD',
        simulate: null,
      });
      expect(metrics.incOrdersCreated).toHaveBeenCalledTimes(1);
    });

    it('defaults simulate to null when not provided', async () => {
      const result = await service.createOrder({ customerId: 'customer-1', items });

      expect(result.simulate).toBeNull();
    });
  });

  describe('getOrderCached', () => {
    it('returns the cached order without hitting the repository', async () => {
      cache.get.mockResolvedValue(order);

      const result = await service.getOrderCached('order-1');

      expect(result).toBe(order);
      expect(cache.get).toHaveBeenCalledWith('order:order-1');
      expect(orders.findById).not.toHaveBeenCalled();
    });

    it('fetches and caches the order on a cache miss', async () => {
      cache.get.mockResolvedValue(null);
      orders.findById.mockResolvedValue(order);

      const result = await service.getOrderCached('order-1');

      expect(result).toBe(order);
      expect(orders.findById).toHaveBeenCalledWith('order-1');
      expect(cache.set).toHaveBeenCalledWith('order:order-1', order, 60);
    });

    it('does not cache when the order is missing', async () => {
      cache.get.mockResolvedValue(null);
      orders.findById.mockResolvedValue(null);

      const result = await service.getOrderCached('missing');

      expect(result).toBeNull();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('listByCustomerCached', () => {
    it('returns the cached list without hitting the repository', async () => {
      cache.get.mockResolvedValue([order]);

      const result = await service.listByCustomerCached('customer-1');

      expect(result).toEqual([order]);
      expect(orders.findByCustomer).not.toHaveBeenCalled();
    });

    it('fetches and caches the list on a cache miss', async () => {
      cache.get.mockResolvedValue(null);
      orders.findByCustomer.mockResolvedValue([order]);

      const result = await service.listByCustomerCached('customer-1');

      expect(result).toEqual([order]);
      expect(orders.findByCustomer).toHaveBeenCalledWith('customer-1');
      expect(cache.set).toHaveBeenCalledWith('orders:customer:customer-1', [order], 60);
    });
  });

  describe('completeOrder', () => {
    it('increments the completed counter when the transition succeeds', async () => {
      orders.completeIfPending.mockResolvedValue(true);

      await expect(service.completeOrder('order-1')).resolves.toBe(true);

      expect(metrics.incOrdersCompleted).toHaveBeenCalledTimes(1);
    });

    it('does not increment when the order was not pending', async () => {
      orders.completeIfPending.mockResolvedValue(false);

      await expect(service.completeOrder('order-1')).resolves.toBe(false);

      expect(metrics.incOrdersCompleted).not.toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('increments the cancelled counter when the transition succeeds', async () => {
      orders.cancelIfPending.mockResolvedValue(true);

      await expect(service.cancelOrder('order-1')).resolves.toBe(true);

      expect(metrics.incOrdersCancelled).toHaveBeenCalledTimes(1);
    });

    it('does not increment when the order was not pending', async () => {
      orders.cancelIfPending.mockResolvedValue(false);

      await expect(service.cancelOrder('order-1')).resolves.toBe(false);

      expect(metrics.incOrdersCancelled).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('removes both the order and customer list cache keys', async () => {
      await service.invalidateCache('order-1', 'customer-1');

      expect(cache.del).toHaveBeenCalledWith('order:order-1', 'orders:customer:customer-1');
    });
  });
});
