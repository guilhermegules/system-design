import { TypeOrmUnitOfWork } from '@infrastructure/persistence/typeorm.unit-of-work';
import { OrderEntity } from '@infrastructure/persistence/order.entity';
import { OutboxEntity } from '@infrastructure/persistence/outbox.entity';
import { Order } from '@domain/order';

describe('TypeOrmUnitOfWork', () => {
  it('runs work inside a transaction with repository adapters', async () => {
    const order = new Order(
      'order-1',
      'customer-1',
      'PENDING',
      [],
      0,
      'USD',
      null,
      new Date(),
      new Date(),
    );
    const orderRepo = {
      save: jest.fn().mockResolvedValue(OrderEntity.fromDomain(order)),
      findById: jest.fn(),
      findByCustomer: jest.fn(),
      completeIfPending: jest.fn(),
      cancelIfPending: jest.fn(),
    };
    const outboxRepo = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
      enqueue: jest.fn().mockResolvedValue(undefined),
      fetchPending: jest.fn(),
      markSent: jest.fn(),
    };
    const em = {
      getRepository: jest.fn((entity: unknown) =>
        entity === OrderEntity ? orderRepo : outboxRepo,
      ),
    };
    const dataSource = {
      transaction: jest.fn(async (cb: (em: unknown) => Promise<unknown>) => cb(em)),
    };

    const uow = new TypeOrmUnitOfWork(dataSource as never);

    const result = await uow.run(async (unit) => {
      await unit.orderRepository.save(order);
      await unit.outboxRepository.enqueue('order.created', 'correlation-1', {});
      return 'done';
    });

    expect(result).toBe('done');
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(em.getRepository).toHaveBeenCalledWith(OrderEntity);
    expect(em.getRepository).toHaveBeenCalledWith(OutboxEntity);
    expect(orderRepo.save).toHaveBeenCalledTimes(1);
    expect(outboxRepo.create).toHaveBeenCalledTimes(1);
    expect(outboxRepo.save).toHaveBeenCalledTimes(1);
  });
});
