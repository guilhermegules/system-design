import { OutboxPoller } from '@infrastructure/messaging/outbox.poller';
import { OutboxEvent } from '@domain/outbox-event';
import { OutboxRepository } from '@domain/ports/outbox-repository';
import { EventPublisher } from '@domain/ports/event-publisher';

describe('OutboxPoller', () => {
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

  let outbox: jest.Mocked<OutboxRepository>;
  let publisher: jest.Mocked<EventPublisher>;
  let poller: OutboxPoller;

  beforeEach(() => {
    outbox = {
      enqueue: jest.fn(),
      fetchPending: jest.fn(),
      markSent: jest.fn(),
    };
    publisher = {
      publish: jest.fn(),
    };

    poller = new OutboxPoller(outbox, publisher);
  });

  it('publishes pending events and marks them as sent', async () => {
    outbox.fetchPending.mockResolvedValue([event]);

    await poller.poll();

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'event-1',
        correlationId: 'correlation-1',
        eventType: 'order.created',
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { orderId: 'order-1' },
      }),
    );
    expect(outbox.markSent).toHaveBeenCalledWith('outbox-1', expect.any(Date));
  });

  it('leaves the event pending when publishing fails', async () => {
    outbox.fetchPending.mockResolvedValue([event]);
    publisher.publish.mockRejectedValue(new Error('kafka down'));

    await expect(poller.poll()).resolves.toBeUndefined();

    expect(outbox.markSent).not.toHaveBeenCalled();
  });
});
