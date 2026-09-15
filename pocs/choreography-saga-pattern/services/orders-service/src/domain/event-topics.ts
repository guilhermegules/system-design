export const TOPICS = {
  orderCreated: 'order.created',
  orderCancelled: 'order.cancelled',
  orderCompleted: 'order.completed',
  inventoryReserved: 'inventory.reserved',
  inventoryReservationFailed: 'inventory.reservation-failed',
  paymentProcessed: 'payment.processed',
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
