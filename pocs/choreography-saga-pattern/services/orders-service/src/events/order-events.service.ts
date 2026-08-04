import { Injectable, Logger } from '@nestjs/common';
import { EventEnvelope } from './event-envelope';
import {
  OrderCancelledPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from './event-payloads';
import { TOPICS } from './event-topics';
import { OrdersService } from '../orders/orders.service';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(
    private readonly orders: OrdersService,
    private readonly outbox: OutboxService,
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
