import { EventEnvelope } from '@domain/event-envelope';
import { InboxRepository } from '@domain/ports/inbox-repository';
import { InboxService } from '@infrastructure/messaging/inbox.service';

describe('InboxService', () => {
  const envelope: EventEnvelope = {
    eventId: 'event-1',
    correlationId: 'correlation-1',
    eventType: 'payment.processed',
    occurredAt: '2026-01-01T00:00:00.000Z',
    payload: { orderId: 'order-1' },
  };

  let repo: jest.Mocked<InboxRepository>;
  let service: InboxService;

  beforeEach(() => {
    repo = {
      exists: jest.fn(),
      markProcessed: jest.fn(),
    };

    service = new InboxService(repo);
  });

  it('processes a new event and marks it as processed', async () => {
    repo.exists.mockResolvedValue(false);
    const handler = jest.fn().mockResolvedValue(undefined);

    const result = await service.process(envelope, handler);

    expect(result).toBe('processed');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(repo.markProcessed).toHaveBeenCalledWith(envelope);
  });

  it('skips a duplicate event without running the handler', async () => {
    repo.exists.mockResolvedValue(true);
    const handler = jest.fn();

    const result = await service.process(envelope, handler);

    expect(result).toBe('duplicate');
    expect(handler).not.toHaveBeenCalled();
    expect(repo.markProcessed).not.toHaveBeenCalled();
  });
});
