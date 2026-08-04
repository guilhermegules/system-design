import { OutboxRepositoryAdapter } from '@infrastructure/persistence/outbox.repository.adapter';
import { OutboxEntity } from '@infrastructure/persistence/outbox.entity';
import { OutboxEvent } from '@domain/outbox-event';

describe('OutboxRepositoryAdapter', () => {
  const event = new OutboxEvent(
    'outbox-1',
    'event-1',
    'order.created',
    'correlation-1',
    { orderId: 'order-1' },
    'PENDING',
    new Date('2026-01-01T00:00:00Z'),
    null,
  );

  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; update: jest.Mock };
  let adapter: OutboxRepositoryAdapter;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };
    adapter = new OutboxRepositoryAdapter(repo as never);
  });

  it('enqueues a pending outbox event', async () => {
    const row = { eventId: 'generated-id' };
    repo.create.mockReturnValue(row);
    repo.save.mockResolvedValue(row);

    await adapter.enqueue('order.created', 'correlation-1', { orderId: 'order-1' });

    expect(repo.create).toHaveBeenCalledWith({
      eventId: expect.any(String),
      eventType: 'order.created',
      correlationId: 'correlation-1',
      payload: { orderId: 'order-1' },
      status: 'PENDING',
    });
    expect(repo.save).toHaveBeenCalledWith(row);
  });

  it('fetches pending events in creation order', async () => {
    const entity = OutboxEntity.fromDomain(event);
    repo.find.mockResolvedValue([entity]);

    await expect(adapter.fetchPending(10)).resolves.toEqual([event]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: 10,
    });
  });

  it('fetches pending events with the default limit', async () => {
    const entity = OutboxEntity.fromDomain(event);
    repo.find.mockResolvedValue([entity]);

    await expect(adapter.fetchPending()).resolves.toEqual([event]);
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: 'PENDING' },
      order: { createdAt: 'ASC' },
      take: 50,
    });
  });

  it('marks an event as sent', async () => {
    const sentAt = new Date('2026-01-02T00:00:00Z');

    await adapter.markSent('outbox-1', sentAt);

    expect(repo.update).toHaveBeenCalledWith('outbox-1', { status: 'SENT', sentAt });
  });
});
