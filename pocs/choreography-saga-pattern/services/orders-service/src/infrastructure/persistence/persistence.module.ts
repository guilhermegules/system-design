import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxRepository } from '../../domain/ports/inbox-repository';
import { OrderRepository } from '../../domain/ports/order-repository';
import { OutboxRepository } from '../../domain/ports/outbox-repository';
import { UnitOfWorkRunner } from '../../application/ports/unit-of-work';
import { InboxEntity } from './inbox.entity';
import { InboxRepositoryAdapter } from './inbox.repository.adapter';
import { OrderEntity } from './order.entity';
import { OrderRepositoryAdapter } from './order.repository.adapter';
import { OutboxEntity } from './outbox.entity';
import { OutboxRepositoryAdapter } from './outbox.repository.adapter';
import { TypeOrmUnitOfWork } from './typeorm.unit-of-work';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OutboxEntity, InboxEntity])],
  providers: [
    { provide: OrderRepository, useClass: OrderRepositoryAdapter },
    { provide: OutboxRepository, useClass: OutboxRepositoryAdapter },
    { provide: InboxRepository, useClass: InboxRepositoryAdapter },
    { provide: UnitOfWorkRunner, useClass: TypeOrmUnitOfWork },
  ],
  exports: [OrderRepository, OutboxRepository, InboxRepository, UnitOfWorkRunner],
})
export class PersistenceModule {}
