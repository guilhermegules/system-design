import { KafkaPublisherAdapter } from '@infrastructure/messaging/kafka/kafka-publisher.adapter';
import { KafkaProducerService } from '@infrastructure/messaging/kafka/kafka-producer.service';
import { EventEnvelope } from '@domain/event-envelope';

describe('KafkaPublisherAdapter', () => {
  it('delegates publish to the producer', async () => {
    const envelope: EventEnvelope = {
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: 'order.created',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1' },
    };
    const producer = { publish: jest.fn().mockResolvedValue(undefined) };
    const adapter = new KafkaPublisherAdapter(producer as unknown as KafkaProducerService);

    await adapter.publish(envelope);

    expect(producer.publish).toHaveBeenCalledWith(envelope);
  });
});
