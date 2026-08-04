import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Inject } from '@nestjs/common';
import { Metrics } from '../domain/ports/metrics';
import { OrderCache } from '../domain/ports/order-cache';
import { OrderRepository } from '../domain/ports/order-repository';
import { OutboxRepository } from '../domain/ports/outbox-repository';
import { TOPICS } from '../domain/event-topics';
import { Order } from '../domain/order';
import { CreateOrderCommand } from './create-order.command';
import { UnitOfWorkRunner } from './ports/unit-of-work';

const ORDER_TTL_SECONDS = 60;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(OrderRepository) private readonly orders: OrderRepository,
    @Inject(OutboxRepository) private readonly outbox: OutboxRepository,
    @Inject(UnitOfWorkRunner) private readonly uow: UnitOfWorkRunner,
    @Inject(OrderCache) private readonly cache: OrderCache,
    @Inject(Metrics) private readonly metrics: Metrics,
  ) {}

  async createOrder(dto: CreateOrderCommand): Promise<Order> {
    const id = randomUUID();
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = Order.create({
      id,
      customerId: dto.customerId,
      items: dto.items,
      totalAmount,
      currency: 'USD',
      simulate: dto.simulate ?? null,
    });

    await this.uow.run(async (uow) => {
      await uow.orderRepository.save(order);
      await uow.outboxRepository.enqueue(TOPICS.orderCreated, id, {
        orderId: id,
        customerId: dto.customerId,
        items: dto.items,
        totalAmount,
        currency: order.currency,
        simulate: order.simulate,
      });
    });

    this.logger.log(`order created: ${id} (${order.status})`);
    this.metrics.incOrdersCreated();
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.findById(id);
  }

  async getOrderCached(id: string): Promise<Order | null> {
    const cacheKey = `order:${id}`;
    const cached = await this.cache.get<Order>(cacheKey);
    if (cached) return cached;

    const order = await this.getOrder(id);
    if (order) {
      await this.cache.set(cacheKey, order, ORDER_TTL_SECONDS);
    }
    return order;
  }

  async listByCustomerCached(customerId: string): Promise<Order[]> {
    const cacheKey = `orders:customer:${customerId}`;
    const cached = await this.cache.get<Order[]>(cacheKey);
    if (cached) return cached;

    const orders = await this.orders.findByCustomer(customerId);
    await this.cache.set(cacheKey, orders, ORDER_TTL_SECONDS);
    return orders;
  }

  async completeOrder(id: string): Promise<boolean> {
    const transitioned = await this.orders.completeIfPending(id);
    if (transitioned) {
      this.metrics.incOrdersCompleted();
    }
    return transitioned;
  }

  async cancelOrder(id: string): Promise<boolean> {
    const transitioned = await this.orders.cancelIfPending(id);
    if (transitioned) {
      this.metrics.incOrdersCancelled();
    }
    return transitioned;
  }

  async invalidateCache(orderId: string, customerId: string): Promise<void> {
    await this.cache.del(`order:${orderId}`, `orders:customer:${customerId}`);
  }
}
