export type OrderEventType =
  | 'order.created'
  | 'order.paid'
  | 'order.payment_failed'
  | 'order.shipped'
  | 'order.delivered'
  | 'order.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'shipment.created'
  | 'shipment.in_transit'
  | 'shipment.delivered';

export interface WebhookEvent<T = unknown> {
  id: string;
  type: OrderEventType;
  createdAt: string;
  source: string;
  data: T;
}

export interface WebhookSubscription {
  id: string;
  subscriberName: string;
  targetUrl: string;
  secret: string;
  events: OrderEventType[];
  active: boolean;
  createdAt: string;
}

export type DeliveryStatus = 'pending' | 'succeeded' | 'retrying' | 'dead_letter';

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  statusCode?: number;
  error?: string;
  durationMs: number;
}

export interface WebhookDeliveryRecord {
  deliveryId: string;
  eventId: string;
  eventType: OrderEventType;
  subscriptionId: string;
  subscriberName: string;
  targetUrl: string;
  status: DeliveryStatus;
  attempts: DeliveryAttempt[];
  payload: WebhookEvent;
  createdAt: string;
  completedAt?: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PROCESSING_SHIPMENT'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  reason: string;
  webhookEventId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentIntentId?: string;
  trackingNumber?: string;
  carrier?: string;
  timeline: OrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}
