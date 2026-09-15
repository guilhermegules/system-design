import { OutboxEvent } from '@domain/outbox-event';

describe('OutboxEvent', () => {
  it('exposes its fields', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');

    const event = new OutboxEvent(
      'outbox-1',
      'event-1',
      'order.created',
      'correlation-1',
      { orderId: 'order-1' },
      'PENDING',
      createdAt,
      null,
    );

    expect(event.id).toBe('outbox-1');
    expect(event.eventId).toBe('event-1');
    expect(event.eventType).toBe('order.created');
    expect(event.correlationId).toBe('correlation-1');
    expect(event.payload).toEqual({ orderId: 'order-1' });
    expect(event.status).toBe('PENDING');
    expect(event.createdAt).toEqual(createdAt);
    expect(event.sentAt).toBeNull();
  });
});
