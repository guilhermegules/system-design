import { TOPICS } from '@domain/event-topics';

describe('TOPICS', () => {
  it('defines the expected topic names', () => {
    expect(TOPICS.orderCreated).toBe('order.created');
    expect(TOPICS.orderCancelled).toBe('order.cancelled');
    expect(TOPICS.orderCompleted).toBe('order.completed');
    expect(TOPICS.inventoryReserved).toBe('inventory.reserved');
    expect(TOPICS.inventoryReservationFailed).toBe('inventory.reservation-failed');
    expect(TOPICS.paymentProcessed).toBe('payment.processed');
  });
});
