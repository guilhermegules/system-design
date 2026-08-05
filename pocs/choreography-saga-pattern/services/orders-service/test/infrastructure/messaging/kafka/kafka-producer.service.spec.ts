import { EventEnvelope } from '@domain/event-envelope';
import { KafkaProducerService } from '@infrastructure/messaging/kafka/kafka-producer.service';

describe('KafkaProducerService', () => {
  let producer: { connect: jest.Mock; send: jest.Mock; disconnect: jest.Mock };
  let kafka: { producer: jest.Mock };
  let service: KafkaProducerService;

  beforeEach(() => {
    producer = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    kafka = {
      producer: jest.fn().mockReturnValue(producer),
    };
    service = new KafkaProducerService(kafka as never);
  });

  it('creates and connects a producer on init', async () => {
    await service.onModuleInit();

    expect(kafka.producer).toHaveBeenCalledTimes(1);
    expect(producer.connect).toHaveBeenCalledTimes(1);
  });

  it('publishes the envelope as a serialized message', async () => {
    const envelope: EventEnvelope = {
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: 'order.created',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1' },
    };

    await service.onModuleInit();
    await service.publish(envelope);

    expect(producer.send).toHaveBeenCalledWith({
      topic: 'order.created',
      messages: [{ key: 'correlation-1', value: JSON.stringify(envelope) }],
    });
  });

  it('disconnects the producer on destroy', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(producer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not fail on destroy when no producer was created', async () => {
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
