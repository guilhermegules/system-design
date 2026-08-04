import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EventEnvelope } from '../domain/event-envelope';
import {
  OrderCancelledPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from '../domain/event-payloads';
import { TOPICS } from '../domain/event-topics';
import { OutboxRepository } from '../domain/ports/outbox-repository';
import { OrderService } from './order.service';

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(
    private readonly orders: OrderService,
    @Inject(OutboxRepository) private readonly outbox: OutboxRepository,
  ) {}

  async onReservationFailed(envelope: EventEnvelope<ReservationFailedPayload>): Promise<void> {
    const { orderId } = envelope.payload;
    const order = await this.orders.getOrder(orderId);
    if (!order) {
      this.logger.warn(`order ${orderId} not found, ignoring reservation-failed`);
      return;
    }

    const transitioned = await this.orders.cancelOrder(orderId);
    if (transitioned) {
      await this.orders.invalidateCache(orderId, order.customerId);
      this.logger.log(`order ${orderId} cancelled (inventory reservation failed)`);
    }
  }

  async onPaymentProcessed(envelope: EventEnvelope<PaymentProcessedPayload>): Promise<void> {
    const { orderId } = envelope.payload;
    const order = await this.orders.getOrder(orderId);
    if (!order) {
      this.logger.warn(`order ${orderId} not found, ignoring payment processed`);
      return;
    }

    const transitioned = await this.orders.completeOrder(orderId);
    if (transitioned) {
      await this.outbox.enqueue(TOPICS.orderCompleted, orderId, { orderId });
      await this.orders.invalidateCache(orderId, order.customerId);
      this.logger.log(`order ${orderId} completed`);
    }
  }

  async onOrderCancelled(envelope: EventEnvelope<OrderCancelledPayload>): Promise<void> {
    const { orderId } = envelope.payload;
    const order = await this.orders.getOrder(orderId);
    if (!order) {
      this.logger.warn(`order ${orderId} not found, ignoring order cancelled`);
      return;
    }

    const transitioned = await this.orders.cancelOrder(orderId);
    if (transitioned) {
      await this.orders.invalidateCache(orderId, order.customerId);
      this.logger.log(`order ${orderId} cancelled (${envelope.payload.reason})`);
    }
  }
}
