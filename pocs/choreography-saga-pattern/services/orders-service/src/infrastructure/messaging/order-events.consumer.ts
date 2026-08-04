import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventEnvelope } from '../../domain/event-envelope';
import {
  OrderCancelledPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from '../../domain/event-payloads';
import { TOPICS } from '../../domain/event-topics';
import { OrderEventsService } from '../../application/order-events.service';
import { InboxService } from './inbox.service';

@Controller()
export class OrderEventsConsumer {
  constructor(
    private readonly events: OrderEventsService,
    private readonly inbox: InboxService,
  ) {}

  @EventPattern(TOPICS.inventoryReservationFailed)
  async onReservationFailed(@Payload() envelope: EventEnvelope<ReservationFailedPayload>): Promise<void> {
    await this.inbox.process(envelope, () => this.events.onReservationFailed(envelope));
  }

  @EventPattern(TOPICS.paymentProcessed)
  async onPaymentProcessed(@Payload() envelope: EventEnvelope<PaymentProcessedPayload>): Promise<void> {
    await this.inbox.process(envelope, () => this.events.onPaymentProcessed(envelope));
  }

  @EventPattern(TOPICS.orderCancelled)
  async onOrderCancelled(@Payload() envelope: EventEnvelope<OrderCancelledPayload>): Promise<void> {
    await this.inbox.process(envelope, () => this.events.onOrderCancelled(envelope));
  }
}
