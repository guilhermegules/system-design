import { OrderRepository } from '../../domain/ports/order-repository';
import { OutboxRepository } from '../../domain/ports/outbox-repository';

export interface UnitOfWork {
  orderRepository: OrderRepository;
  outboxRepository: OutboxRepository;
}

export abstract class UnitOfWorkRunner {
  abstract run<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T>;
}
