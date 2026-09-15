import { InboxEvent } from '@domain/inbox-event';

describe('InboxEvent', () => {
  it('exposes its fields', () => {
    const processedAt = new Date('2026-01-01T00:00:00Z');

    const event = new InboxEvent(
      'event-1',
      'payment.processed',
      'correlation-1',
      { orderId: 'order-1' },
      processedAt,
    );

    expect(event.eventId).toBe('event-1');
    expect(event.eventType).toBe('payment.processed');
    expect(event.correlationId).toBe('correlation-1');
    expect(event.payload).toEqual({ orderId: 'order-1' });
    expect(event.processedAt).toEqual(processedAt);
  });
});
