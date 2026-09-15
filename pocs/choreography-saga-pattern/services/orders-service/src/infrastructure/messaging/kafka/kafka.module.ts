import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from './kafka.tokens';
import { KafkaProducerService } from './kafka-producer.service';

@Global()
@Module({
  providers: [
    {
      provide: KAFKA_CLIENT,
      useFactory: (config: ConfigService) =>
        new Kafka({
          clientId: 'orders-service',
          brokers: config.getOrThrow<string[]>('kafka.brokers'),
          retry: { retries: 5 },
        }),
      inject: [ConfigService],
    },
    KafkaProducerService,
  ],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
