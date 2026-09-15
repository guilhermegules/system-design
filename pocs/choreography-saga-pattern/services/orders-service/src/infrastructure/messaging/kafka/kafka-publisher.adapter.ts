import { EventEnvelope } from '@domain/event-envelope';
import { EventPublisher } from '@domain/ports/event-publisher';
import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';

@Injectable()
export class KafkaPublisherAdapter implements EventPublisher {
  constructor(private readonly producer: KafkaProducerService) {}

  async publish(envelope: EventEnvelope): Promise<void> {
    await this.producer.publish(envelope);
  }
}
