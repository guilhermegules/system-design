import { buildEnvelope } from '@domain/event-envelope';

describe('buildEnvelope', () => {
  it('serializes occurredAt to an ISO string', () => {
    const occurredAt = new Date('2026-01-01T00:00:00.000Z');

    const envelope = buildEnvelope({
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: 'order.created',
      occurredAt,
      payload: { orderId: 'order-1' },
    });

    expect(envelope.eventId).toBe('event-1');
    expect(envelope.correlationId).toBe('correlation-1');
    expect(envelope.eventType).toBe('order.created');
    expect(envelope.occurredAt).toBe('2026-01-01T00:00:00.000Z');
    expect(envelope.payload).toEqual({ orderId: 'order-1' });
  });
});
