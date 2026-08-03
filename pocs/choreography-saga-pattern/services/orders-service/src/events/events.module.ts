import { Module } from '@nestjs/common';
import { InboxModule } from '../inbox/inbox.module';
import { OrdersModule } from '../orders/orders.module';
import { OutboxModule } from '../outbox/outbox.module';
import { OrderEventsConsumer } from './order-events.consumer';
import { OrderEventsService } from './order-events.service';

@Module({
  imports: [OrdersModule, OutboxModule, InboxModule],
  controllers: [OrderEventsConsumer],
  providers: [OrderEventsService],
})
export class EventsModule {}
