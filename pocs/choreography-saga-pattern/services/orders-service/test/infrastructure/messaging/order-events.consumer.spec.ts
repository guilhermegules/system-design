import { OrderEventsService } from '@application/order-events.service';
import { EventEnvelope } from '@domain/event-envelope';
import {
  OrderCancelledPayload,
  PaymentProcessedPayload,
  ReservationFailedPayload,
} from '@domain/event-payloads';
import { TOPICS } from '@domain/event-topics';
import { InboxService } from '@infrastructure/messaging/inbox.service';
import { OrderEventsConsumer } from '@infrastructure/messaging/order-events.consumer';

describe('OrderEventsConsumer', () => {
  let events: jest.Mocked<
    Pick<OrderEventsService, 'onReservationFailed' | 'onPaymentProcessed' | 'onOrderCancelled'>
  >;
  let inbox: { process: jest.Mock };
  let consumer: OrderEventsConsumer;

  beforeEach(() => {
    events = {
      onReservationFailed: jest.fn(),
      onPaymentProcessed: jest.fn(),
      onOrderCancelled: jest.fn(),
    };
    inbox = {
      process: jest.fn(async (_envelope: EventEnvelope, handler: () => Promise<void>) => handler()),
    };
    consumer = new OrderEventsConsumer(
      events as unknown as OrderEventsService,
      inbox as unknown as InboxService,
    );
  });

  it('processes reservation failures through the inbox', async () => {
    const envelope: EventEnvelope<ReservationFailedPayload> = {
      eventId: 'event-1',
      correlationId: 'correlation-1',
      eventType: TOPICS.inventoryReservationFailed,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', reason: 'out of stock' },
    };

    await consumer.onReservationFailed(envelope);

    expect(inbox.process).toHaveBeenCalledWith(envelope, expect.any(Function));
    expect(events.onReservationFailed).toHaveBeenCalledWith(envelope);
  });

  it('processes payment events through the inbox', async () => {
    const envelope: EventEnvelope<PaymentProcessedPayload> = {
      eventId: 'event-2',
      correlationId: 'correlation-2',
      eventType: TOPICS.paymentProcessed,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', paymentId: 'payment-1', status: 'approved' },
    };

    await consumer.onPaymentProcessed(envelope);

    expect(inbox.process).toHaveBeenCalledWith(envelope, expect.any(Function));
    expect(events.onPaymentProcessed).toHaveBeenCalledWith(envelope);
  });

  it('processes cancellation events through the inbox', async () => {
    const envelope: EventEnvelope<OrderCancelledPayload> = {
      eventId: 'event-3',
      correlationId: 'correlation-3',
      eventType: TOPICS.orderCancelled,
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { orderId: 'order-1', reason: 'user requested' },
    };

    await consumer.onOrderCancelled(envelope);

    expect(inbox.process).toHaveBeenCalledWith(envelope, expect.any(Function));
    expect(events.onOrderCancelled).toHaveBeenCalledWith(envelope);
  });
});
