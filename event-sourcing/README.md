# Event Sourcing

Event Sourcing is an architectural pattern where **you don’t store the current state of your system directly**.
Instead, you store a **sequence of events** that describe everything that happened to your system, and the current state is **reconstructed by replaying those events**.

## Core idea

> State = result of replaying events

Instead of:

```
Order {
  id: 1
  status: "SHIPPED"
  total: 120.00
}
```

You store:

```
OrderCreated
ItemAdded
ItemAdded
OrderConfirmed
OrderShipped
```

## Key concepts

### 1. Event

An event is:

- Something that already happened
- Immutable
- Describes a fact
- OBS: Events are past tense

### 2. Event store

The event store is the source of truth

- Appends events
- Preserves order
- Allows replay

Something like

```
[ Event 1 ] → [ Event 2 ] → [ Event 3 ] → ...
```

### 3. Aggregate

An aggregate:

- Handles commands
- Applies events
- Rebuilds state by replaying events

```
Command -> Aggregate -> Events -> Event store
```

### 4. Command vs Event

| Command        | Event          |
| -------------- | -------------- |
| Intent         | Fact           |
| Can fail       | Never fails    |
| Present/future | Past           |
| `CreateOrder`  | `OrderCreated` |

## Why use event sourcing?

### Benefits

#### Full history

You know:

- Who did what
- When
- In what order

Perfect for:

- Finance
- Legal systems
- Healthcare
- Payments

#### Time travel & debugging

You can:

- Rebuild state at any point in time
- Debug production issues by replaying events

#### Multiple read models

Same events -> Different projections:

- One for UI
- One for reports
- One for analytics

#### Natural fit with CQRS

Event sourcing works extremely well with CQRS

- Commands write events
- Queries read projections

### Downsides

#### Complexity

- Harder mental model
- More moving parts

#### Event versioning

Once an event is stored:

- You cannot change it
- You must handle evolution carefully

#### Eventual consistency

Read models:

- Are not immediately updated
- Require async processing

#### Not good for CRUD simple apps

If your system is, simple, CRUD-heavy, no audit/history needed -> Event sourcing is probably overkill

## Typical architecture

```
Client
  ↓ Command
Command Handler
  ↓
Aggregate
  ↓ Events
Event Store
  ↓
Event Handlers
  ↓
Read Models / Projections
```

## Links

- [Event Sourcing Azure Docs](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
