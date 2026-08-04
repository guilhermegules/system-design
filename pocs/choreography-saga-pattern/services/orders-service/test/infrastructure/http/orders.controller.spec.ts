import { NotFoundException } from '@nestjs/common';
import { OrdersController } from '@infrastructure/http/orders.controller';
import { OrderService } from '@application/order.service';
import { Order, OrderItem } from '@domain/order';

describe('OrdersController', () => {
  const items: OrderItem[] = [{ productId: 'p1', quantity: 1, unitPrice: 10 }];
  const order = new Order(
    'order-1',
    'customer-1',
    'PENDING',
    items,
    10,
    'USD',
    null,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );

  let orders: jest.Mocked<
    Pick<OrderService, 'createOrder' | 'getOrderCached' | 'listByCustomerCached'>
  >;
  let controller: OrdersController;

  beforeEach(() => {
    orders = {
      createOrder: jest.fn(),
      getOrderCached: jest.fn(),
      listByCustomerCached: jest.fn(),
    };
    controller = new OrdersController(orders as unknown as OrderService);
  });

  describe('create', () => {
    it('delegates to the service', async () => {
      const dto = { customerId: 'customer-1', items } as never;
      orders.createOrder.mockResolvedValue(order);

      await expect(controller.create(dto)).resolves.toBe(order);
      expect(orders.createOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('returns the cached order', async () => {
      orders.getOrderCached.mockResolvedValue(order);

      await expect(controller.findOne('order-1')).resolves.toBe(order);
      expect(orders.getOrderCached).toHaveBeenCalledWith('order-1');
    });

    it('throws a 404 when the order is missing', async () => {
      orders.getOrderCached.mockResolvedValue(null);

      await expect(controller.findOne('order-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findByCustomer', () => {
    it('returns the cached list when a customerId is provided', async () => {
      orders.listByCustomerCached.mockResolvedValue([order]);

      await expect(controller.findByCustomer('customer-1')).resolves.toEqual([order]);
      expect(orders.listByCustomerCached).toHaveBeenCalledWith('customer-1');
    });

    it('returns an empty list when customerId is missing', async () => {
      await expect(controller.findByCustomer(undefined)).resolves.toEqual([]);
      expect(orders.listByCustomerCached).not.toHaveBeenCalled();
    });
  });
});
