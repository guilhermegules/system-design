import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UnitOfWork, UnitOfWorkRunner } from '@application/ports/unit-of-work';
import { OrderEntity } from './order.entity';
import { OrderRepositoryAdapter } from './order.repository.adapter';
import { OutboxEntity } from './outbox.entity';
import { OutboxRepositoryAdapter } from './outbox.repository.adapter';

@Injectable()
export class TypeOrmUnitOfWork implements UnitOfWorkRunner {
  constructor(private readonly dataSource: DataSource) {}

  async run<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (em) => {
      const uow: UnitOfWork = {
        orderRepository: new OrderRepositoryAdapter(em.getRepository(OrderEntity)),
        outboxRepository: new OutboxRepositoryAdapter(em.getRepository(OutboxEntity)),
      };
      return work(uow);
    });
  }
}
