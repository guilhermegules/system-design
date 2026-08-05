import { OutboxEvent } from '@domain/outbox-event';
import { OutboxEntity } from '@infrastructure/persistence/outbox.entity';

describe('OutboxEntity', () => {
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

  it('maps from domain to entity', () => {
    const entity = OutboxEntity.fromDomain(event);

    expect(entity.id).toBe('outbox-1');
    expect(entity.eventId).toBe('event-1');
    expect(entity.eventType).toBe('order.created');
    expect(entity.correlationId).toBe('correlation-1');
    expect(entity.payload).toEqual({ orderId: 'order-1' });
    expect(entity.status).toBe('PENDING');
    expect(entity.createdAt).toEqual(event.createdAt);
    expect(entity.sentAt).toBeNull();
  });

  it('maps from entity back to domain', () => {
    const entity = OutboxEntity.fromDomain(event);

    expect(entity.toDomain()).toEqual(event);
  });
});
