import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from '../../application/orders.module';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { PersistenceModule } from '../persistence/persistence.module';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaPublisherAdapter } from './kafka/kafka-publisher.adapter';
import { InboxService } from './inbox.service';
import { OrderEventsConsumer } from './order-events.consumer';
import { OutboxPoller } from './outbox.poller';

@Module({
  imports: [PersistenceModule, OrdersModule, KafkaModule, ScheduleModule],
  controllers: [OrderEventsConsumer],
  providers: [
    InboxService,
    OutboxPoller,
    { provide: EventPublisher, useClass: KafkaPublisherAdapter },
  ],
  exports: [EventPublisher],
})
export class MessagingModule {}
