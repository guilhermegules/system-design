# cqrs-event-driven-poc

Understand the principles and benefits of CQRS.

## 1. The Core Problem They Address

In traditional systems:

- One model is used for both reading data and writing data.
- This works fine for small apps but becomes a problem when: - Read and write performance requirements differ. - Data access patterns are complex and varied. - Systems grow to multiple services or domains. - You want to react to changes in real-time across different parts of your system.
  `CQRS` and `EDA` address **scalability, flexibility, and decoupling** in large systems.

## 2. CQRS — Command Query Responsibility Segregation

CQRS is a pattern where you separate:

- Commands → operations that change state (writes).
- Queries → operations that return data (reads).

Key Idea:

> The model optimized for writing data is often not optimal for reading data, so separate them.

### 2.1 CQRS Components

1. Command Side (Write Model)
   - Handles commands like CreateOrder, UpdateInventory
   - Performs validations and business logic
   - Changes the state of the system
   - Usually writes to a transactional store (normalized DB, event store, etc)
2. Query side (Read Model)
   - Handles queries like GetOrderDetails, ListProducts
   - Reads from a denormalizedor optimized-for-read store
   - Can use different databases (Elasticsearch, Redis, SQL)

### 2.2 Example

Without CQRS:

```sql
SELECT * FROM Orders WHERE status='pending'; -- same DB for reads and writes
INSERT INTO Orders (...) VALUES (...);
```

With CQRS:

- Command Service updates an Orders Write DB.
- An event is emitted (e.g., OrderCreated).
- The Query Service listens to events and updates a Read DB optimized for queries.

### 2.3 Benefits of CQRS

- **Performance** → optimize read and write models independently.
- **Scalability** → scale reads and writes separately.
- **Flexibility** → different databases for different needs.
- **Clear separation** of business logic from read logic.

### 2.4 Trade-offs

- More moving parts.
- Eventual consistency (writes are not immediately visible in reads).
- More complex deployments.

## 3. Event-Driven Architecture (EDA)

**Definition:** EDA is a style where components communicate by producing and consuming events rather than direct calls.

Key Idea:

> Instead of "Service A calls Service B," Service A emits an event, and any service interested in that event reacts to it.

### 3.1 Core Concepts in EDA

1. Event
   - A record of something that has happened.
   - Immutable (cannot be changed after being published).
   - Example: OrderPlaced, InventoryLow, PaymentProcessed.
2. Producer
   - Publishes events (e.g., Order Service publishes OrderPlaced).
3. Consumer
   - Subscribes to events and reacts to them (e.g., Inventory Service consumes OrderPlaced to decrease stock).
4. Event Bus / Broker
   - Middleware that routes events between producers and consumers.
   - Examples: Kafka, RabbitMQ, NATS, AWS SNS/SQS.

### 3.2 Types of EDA

- **Event Notification:** Just tells others something happened (lightweight).
- **Event-Carried State Transfer:** Event carries enough data for consumers to update their state.
- **Event Sourcing:** Events are the source of truth (system state is rebuilt by replaying events).

## 4. How CQRS and EDA Work Together

In many modern systems:

- The **Command Side** of CQRS emits events when state changes
- Those events are picked up by:
  - The **Query side** to update read models
  - Other **bounded contexts** or **microsservices** for further processing

Simple diagram of events:

```
   [Client]
      |
  (Command API)
      |
  [Command Service] -----> [Write DB]
      | emits event
   (Event Bus)   <------->  [Other Services]
      |
  [Query Service] -----> [Read DB]
      |
  (Query API)
      |
   [Client]
```

## 5. Benefits of CQRS + EDA Together

- Loose coupling between services.
- Scalable: Reads and writes handled separately.
- Flexibility: Different storage for different use cases.
- Resilience: Services can fail independently; events can be replayed.
- Extensibility: New services can subscribe to events without touching existing ones.
