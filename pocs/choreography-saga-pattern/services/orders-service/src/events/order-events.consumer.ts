import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventEnvelope } from './event-envelope';
import {
  PaymentFailedPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from './event-payloads';
import { TOPICS } from './event-topics';
import { InboxService } from '../inbox/inbox.service';
import { OrderEventsService } from './order-events.service';

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

  @EventPattern(TOPICS.paymentFailed)
  async onPaymentFailed(@Payload() envelope: EventEnvelope<PaymentFailedPayload>): Promise<void> {
    await this.inbox.process(envelope, () => this.events.onPaymentFailed(envelope));
  }
}
