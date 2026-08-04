import { InboxRepositoryAdapter } from '@infrastructure/persistence/inbox.repository.adapter';
import { EventEnvelope } from '@domain/event-envelope';

describe('InboxRepositoryAdapter', () => {
  let repo: { exists: jest.Mock; create: jest.Mock; save: jest.Mock };
  let adapter: InboxRepositoryAdapter;

  beforeEach(() => {
    repo = {
      exists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    adapter = new InboxRepositoryAdapter(repo as never);
  });

  it('checks whether an event has been processed', async () => {
    repo.exists.mockResolvedValue(true);

    await expect(adapter.exists('event-1')).resolves.toBe(true);
    expect(repo.exists).toHaveBeenCalledWith({ where: { eventId: 'event-1' } });
  });

  it('marks an event as processed', async () => {
    const envelope: EventEnvelope = {
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: 'payment.processed',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1' },
    };
    const row = { eventId: 'event-1' };
    repo.create.mockReturnValue(row);
    repo.save.mockResolvedValue(row);

    await adapter.markProcessed(envelope);

    expect(repo.create).toHaveBeenCalledWith({
      eventId: 'event-1',
      eventType: 'payment.processed',
      correlationId: 'correlation-1',
      payload: { orderId: 'order-1' },
    });
    expect(repo.save).toHaveBeenCalledWith(row);
  });
});
