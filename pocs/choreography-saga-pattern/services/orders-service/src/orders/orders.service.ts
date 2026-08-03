import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RedisService } from '../cache/redis.service';
import { TOPICS } from '../events/event-topics';
import { OutboxService } from '../outbox/outbox.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

const ORDER_TTL_SECONDS = 60;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly outbox: OutboxService,
    private readonly redis: RedisService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const id = randomUUID();
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = this.repo.create({
      id,
      customerId: dto.customerId,
      status: 'PENDING',
      items: dto.items,
      totalAmount,
      currency: 'USD',
      simulate: dto.simulate ?? null,
    });

    await this.dataSource.transaction(async (em) => {
      await em.save(order);
      await this.outbox.enqueue(TOPICS.orderCreated, id, {
        orderId: id,
        customerId: dto.customerId,
        items: dto.items,
        totalAmount,
        currency: order.currency,
        simulate: order.simulate,
      });
    });

    this.logger.log(`order created: ${id} (${order.status})`);
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getOrderCached(id: string): Promise<Order | null> {
    const cacheKey = `order:${id}`;
    const cached = await this.redis.get<Order>(cacheKey);
    if (cached) return cached;

    const order = await this.getOrder(id);
    if (order) {
      await this.redis.set(cacheKey, order, ORDER_TTL_SECONDS);
    }
    return order;
  }

  async listByCustomerCached(customerId: string): Promise<Order[]> {
    const cacheKey = `orders:customer:${customerId}`;
    const cached = await this.redis.get<Order[]>(cacheKey);
    if (cached) return cached;

    const orders = await this.repo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    await this.redis.set(cacheKey, orders, ORDER_TTL_SECONDS);
    return orders;
  }

  async completeOrder(id: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({ status: 'COMPLETED' })
      .where('id = :id AND status = :status', { id, status: 'PENDING' })
      .execute();
    return (result.affected ?? 0) > 0;
  }

  async cancelOrder(id: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Order)
      .set({ status: 'CANCELLED' })
      .where('id = :id AND status = :status', { id, status: 'PENDING' })
      .execute();
    return (result.affected ?? 0) > 0;
  }

  async invalidateCache(orderId: string, customerId: string): Promise<void> {
    await this.redis.del(`order:${orderId}`, `orders:customer:${customerId}`);
  }

  requireOrder(order: Order | null): Order {
    if (!order) throw new NotFoundException('order not found');
    return order;
  }
}
