import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { EventEnvelope } from '@domain/event-envelope';
import { KAFKA_CLIENT } from './kafka.module';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer;

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {}

  async onModuleInit(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    this.logger.log('kafka producer connected');
  }

  async publish(envelope: EventEnvelope): Promise<void> {
    await this.producer.send({
      topic: envelope.eventType,
      messages: [
        {
          key: envelope.correlationId,
          value: JSON.stringify(envelope),
        },
      ],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer?.disconnect();
  }
}
