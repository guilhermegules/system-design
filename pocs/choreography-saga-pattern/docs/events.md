# Event Contracts

This document defines the shared event envelope, topics and payloads used by the
choreographed saga. All events are serialized as JSON and produced **at-least-once**
to Kafka, so every consumer MUST be idempotent (dedupe by `eventId`).

## Envelope

Every message published to a topic uses the following envelope:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "correlationId": "0d5c1a3e-2b4f-4a8e-9c6d-3f1e5a7b9c21",
  "eventType": "order.created",
  "occurredAt": "2026-08-03T19:58:00Z",
  "payload": {}
}
```

| Field           | Type   | Description                                             |
|-----------------|--------|---------------------------------------------------------|
| `eventId`       | string | Unique event id (UUIDv4). Used for idempotency.         |
| `correlationId` | string | Saga correlation id, always the `orderId`.              |
| `eventType`     | string | Fully-qualified event type, matches the topic.          |
| `occurredAt`    | string | ISO-8601 UTC timestamp of the event occurrence.         |
| `payload`       | object | Type-specific payload, described per topic below.       |

Kafka message `key` is always the `correlationId` so all events of one saga land
on the same partition and preserve ordering.

## Topics

Provisioned by `infra/kafka/init-topics.sh` (3 partitions, RF 1):

| Topic                          | Producer          | Consumers                  |
|--------------------------------|-------------------|----------------------------|
| `order.created`                | orders-service    | inventory-service          |
| `inventory.reserved`           | inventory-service | payment-service            |
| `inventory.reservation-failed` | inventory-service | orders-service             |
| `payment.processed`            | payment-service   | orders-service             |
| `payment.failed`               | payment-service   | orders-service             |
| `order.cancelled`              | orders-service    | inventory-service          |
| `order.completed`              | orders-service    | — (audit / observability)  |

## Saga Flow

```
POST /orders
   │ order.created ──────────► inventory-service
   │                                │  success  inventory.reserved ──► payment-service
   │                                │  failure  inventory.reservation-failed ─┐
   │                                                                          │
   │ ◄────────────────────────────────────────────────────────────────────────┘
   │                                payment-service
   │                                  │  success  payment.processed ──► order COMPLETED (order.completed)
   │                                  │  failure  payment.failed ─────► order CANCELLED + order.cancelled
   │                                                                            │
   │ ◄───────────────────────────────────────────────────────────────────────────┘ (inventory releases stock)
```

## Payloads

### `order.created` (orders → inventory)

```json
{
  "orderId": "uuid",
  "customerId": "uuid",
  "items": [
    { "productId": "sku-1", "quantity": 2, "unitPrice": 49.9 }
  ],
  "totalAmount": 99.8,
  "currency": "USD",
  "simulate": null
}
```

`simulate` is a dev-only field used to force a failure downstream:
`null` | `"inventory_failure"` | `"payment_failure"`.

### `inventory.reserved` (inventory → payment)

```json
{
  "orderId": "uuid",
  "reservationId": "uuid",
  "simulate": null
}
```

### `inventory.reservation-failed` (inventory → orders)

```json
{
  "orderId": "uuid",
  "reason": "INSUFFICIENT_STOCK"
}
```

### `payment.processed` (payment → orders)

```json
{
  "orderId": "uuid",
  "paymentId": "uuid",
  "status": "PROCESSED"
}
```

### `payment.failed` (payment → orders)

```json
{
  "orderId": "uuid",
  "paymentId": "uuid",
  "reason": "PAYMENT_REJECTED"
}
```

### `order.cancelled` (orders → inventory)

```json
{
  "orderId": "uuid",
  "reason": "PAYMENT_FAILED | INVENTORY_RESERVATION_FAILED"
}
```

Inventory reacts by releasing any active reservation for the order. If no
reservation exists the event is a no-op.

### `order.completed` (orders → audit)

```json
{
  "orderId": "uuid"
}
```

## Idempotency & Reliability

- **Transactional outbox:** every service writes its outgoing events to an
  `outbox` table in the same DB transaction as the state change. A poller
  publishes `PENDING` rows to Kafka and marks them `SENT`.
- **Inbox / dedupe:** every consumer records processed `eventId`s in an `inbox`
  table before handling; duplicates are acknowledged and skipped.
- **Ordering:** guaranteed per `correlationId` thanks to keyed partitioning.
