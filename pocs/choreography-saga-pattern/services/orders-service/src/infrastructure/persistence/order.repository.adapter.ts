import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@domain/order';
import { OrderRepository } from '@domain/ports/order-repository';
import { OrderEntity } from './order.entity';

@Injectable()
export class OrderRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const saved = await this.repo.save(OrderEntity.fromDomain(order));
    return saved.toDomain();
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? row.toDomain() : null;
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const rows = await this.repo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => row.toDomain());
  }

  async completeIfPending(id: string): Promise<boolean> {
    const result = await this.repo.update(
      { id, status: 'PENDING' },
      { status: 'COMPLETED' },
    );
    return (result.affected ?? 0) > 0;
  }

  async cancelIfPending(id: string): Promise<boolean> {
    const result = await this.repo.update(
      { id, status: 'PENDING' },
      { status: 'CANCELLED' },
    );
    return (result.affected ?? 0) > 0;
  }
}
