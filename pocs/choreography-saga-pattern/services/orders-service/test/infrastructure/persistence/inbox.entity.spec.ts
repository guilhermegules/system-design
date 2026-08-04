import { InboxEntity } from '@infrastructure/persistence/inbox.entity';
import { InboxEvent } from '@domain/inbox-event';

describe('InboxEntity', () => {
  it('maps from domain to entity', () => {
    const event = new InboxEvent(
      'event-1',
      'payment.processed',
      'correlation-1',
      { orderId: 'order-1' },
      new Date('2026-01-01T00:00:00Z'),
    );

    const entity = InboxEntity.fromDomain(event);

    expect(entity.eventId).toBe('event-1');
    expect(entity.eventType).toBe('payment.processed');
    expect(entity.correlationId).toBe('correlation-1');
    expect(entity.payload).toEqual({ orderId: 'order-1' });
    expect(entity.processedAt).toEqual(event.processedAt);
  });
});
