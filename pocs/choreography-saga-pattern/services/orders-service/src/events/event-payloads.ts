import { OrderItem } from '../orders/order.entity';

export interface OrderCreatedPayload {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  simulate: string | null;
}

export interface ReservationFailedPayload {
  orderId: string;
  reason: string;
}

export interface PaymentProcessedPayload {
  orderId: string;
  paymentId: string;
  status: string;
}

export interface OrderCancelledPayload {
  orderId: string;
  reason: string;
}
