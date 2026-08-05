import { OrderService } from '@application/order.service';
import { OrderEventsService } from '@application/order-events.service';
import { EventEnvelope } from '@domain/event-envelope';
import {
  OrderCancelledPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from '@domain/event-payloads';
import { TOPICS } from '@domain/event-topics';
import { Order, OrderItem } from '@domain/order';
import { OutboxRepository } from '@domain/ports/outbox-repository';

describe('OrderEventsService', () => {
  const items: OrderItem[] = [{ productId: 'p1', quantity: 2, unitPrice: 10 }];

  const order = new Order(
    'order-1',
    'customer-1',
    'PENDING',
    items,
    20,
    'USD',
    null,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );

  let orders: jest.Mocked<
    Pick<OrderService, 'getOrder' | 'cancelOrder' | 'completeOrder' | 'invalidateCache'>
  >;
  let outbox: jest.Mocked<OutboxRepository>;
  let service: OrderEventsService;

  beforeEach(() => {
    orders = {
      getOrder: jest.fn(),
      cancelOrder: jest.fn(),
      completeOrder: jest.fn(),
      invalidateCache: jest.fn(),
    };
    outbox = {
      enqueue: jest.fn(),
      fetchPending: jest.fn(),
      markSent: jest.fn(),
    };

    service = new OrderEventsService(orders as unknown as OrderService, outbox);
  });

  describe('onReservationFailed', () => {
    const envelope: EventEnvelope<ReservationFailedPayload> = {
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: TOPICS.inventoryReservationFailed,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', reason: 'out of stock' },
    };

    it('cancels the order and invalidates the cache when found', async () => {
      orders.getOrder.mockResolvedValue(order);
      orders.cancelOrder.mockResolvedValue(true);

      await service.onReservationFailed(envelope);

      expect(orders.cancelOrder).toHaveBeenCalledWith('order-1');
      expect(orders.invalidateCache).toHaveBeenCalledWith('order-1', 'customer-1');
    });

    it('does not cancel when the transition fails', async () => {
      orders.getOrder.mockResolvedValue(order);
      orders.cancelOrder.mockResolvedValue(false);

      await service.onReservationFailed(envelope);

      expect(orders.invalidateCache).not.toHaveBeenCalled();
    });

    it('ignores the event when the order does not exist', async () => {
      orders.getOrder.mockResolvedValue(null);

      await service.onReservationFailed(envelope);

      expect(orders.cancelOrder).not.toHaveBeenCalled();
    });
  });

  describe('onPaymentProcessed', () => {
    const envelope: EventEnvelope<PaymentProcessedPayload> = {
      eventId: 'event-2',
      correlationId: 'correlation-2',
      eventType: TOPICS.paymentProcessed,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', paymentId: 'payment-1', status: 'approved' },
    };

    it('completes the order, enqueues order.completed and invalidates the cache', async () => {
      orders.getOrder.mockResolvedValue(order);
      orders.completeOrder.mockResolvedValue(true);

      await service.onPaymentProcessed(envelope);

      expect(orders.completeOrder).toHaveBeenCalledWith('order-1');
      expect(outbox.enqueue).toHaveBeenCalledWith(TOPICS.orderCompleted, 'order-1', {
        orderId: 'order-1',
      });
      expect(orders.invalidateCache).toHaveBeenCalledWith('order-1', 'customer-1');
    });

    it('does not enqueue when the order was not pending', async () => {
      orders.getOrder.mockResolvedValue(order);
      orders.completeOrder.mockResolvedValue(false);

      await service.onPaymentProcessed(envelope);

      expect(outbox.enqueue).not.toHaveBeenCalled();
      expect(orders.invalidateCache).not.toHaveBeenCalled();
    });

    it('ignores the event when the order does not exist', async () => {
      orders.getOrder.mockResolvedValue(null);

      await service.onPaymentProcessed(envelope);

      expect(orders.completeOrder).not.toHaveBeenCalled();
      expect(outbox.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('onOrderCancelled', () => {
    const envelope: EventEnvelope<OrderCancelledPayload> = {
      eventId: 'event-3',
      correlationId: 'correlation-3',
      eventType: TOPICS.orderCancelled,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', reason: 'user requested' },
    };

    it('cancels the order and invalidates the cache when found', async () => {
      orders.getOrder.mockResolvedValue(order);
      orders.cancelOrder.mockResolvedValue(true);

      await service.onOrderCancelled(envelope);

      expect(orders.cancelOrder).toHaveBeenCalledWith('order-1');
      expect(orders.invalidateCache).toHaveBeenCalledWith('order-1', 'customer-1');
    });

    it('ignores the event when the order does not exist', async () => {
      orders.getOrder.mockResolvedValue(null);

      await service.onOrderCancelled(envelope);

      expect(orders.cancelOrder).not.toHaveBeenCalled();
    });
  });
});
