# CQRS Architecture Documentation

## Overview

This document provides a comprehensive guide to the Command Query Responsibility Segregation (CQRS) pattern implementation.

## What is CQRS?

CQRS is an architectural pattern that separates read and write operations into two independent systems:

- **Command Side (Write)**: Handles data modifications (Create, Update, Delete)
- **Query Side (Read)**: Handles data retrieval (Read, Search, Filter)

This separation allows each side to be optimized independently for its specific use case.

## Key Principles

### 1. **Separation of Concerns**

Commands and queries are handled by completely different models and services, making the codebase more maintainable.

### 2. **Optimized Data Models**

- **Write Model**: Normalized, ACID-compliant (PostgreSQL)
- **Read Model**: Denormalized, optimized for queries (MongoDB)

### 3. **Eventual Consistency**

After a command is executed, the read model is updated asynchronously through events, achieving eventual consistency.

### 4. **Event-Driven**

All changes are published as domain events, providing a complete audit trail and enabling multiple subscribers.

## Architecture Components

### Command Service (Port 8080)

**Responsibilities:**

- Accept write commands (Create, Update, Delete)
- Validate commands
- Execute commands on write database
- Publish domain events
- Return command results

**Technology:**

- HTTP Server (Go net/http)
- PostgreSQL (Write Database)
- RabbitMQ (Event Publisher)

**Flow:**

```
Client Request → HTTP Handler → Command Service → PostgreSQL
                                                  → RabbitMQ (Event)
```

### Query Service (Port 8081)

**Responsibilities:**

- Accept read queries
- Retrieve data from read database
- Return optimized results
- Maintain read models (via event consumption)

**Technology:**

- HTTP Server (Go net/http)
- MongoDB (Read Database)
- RabbitMQ (Event Subscriber)

**Flow:**

```
Client Request → HTTP Handler → Query Service → MongoDB
                                              ↓
                               (EventConsumer updates MongoDB)
```

### Event Bus (RabbitMQ)

**Responsibilities:**

- Distribute events from command side to query side
- Ensure reliable message delivery
- Support multiple subscribers
- Maintain event history

**Key Features:**

- Durable queues (survive broker restart)
- Message persistence
- Consumer acknowledgment
- Automatic redelivery on failure

## Data Flow

### 1. User Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ POST /users
                         ▼
        ┌────────────────────────────────┐
        │  Command Service HTTP Handler  │
        │  - Validate input              │
        │  - Create CreateUserCommand    │
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   CommandService.CreateUser()  │
        │  - Save to PostgreSQL          │
        │  - Create UserCreatedEvent     │
        │  - Publish event to RabbitMQ   │
        └────────────────┬───────────────┘
                         │
        ┌────────────────┴───────────────┐
        ▼                                 ▼
   PostgreSQL                        RabbitMQ
   (User stored)                  (Event queued)
                                      │
                                      │ user_events queue
                                      ▼
                           ┌──────────────────────┐
                           │  EventConsumer       │
                           │  - Consume event     │
                           │  - Update read model │
                           └──────────┬───────────┘
                                      │
                                      ▼
                                   MongoDB
                                (User indexed)
                                      │
                                      ▼
                           Query Service ready
                           to return data
```

### 2. User Query Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ GET /users/{id}
                         ▼
        ┌────────────────────────────────┐
        │  Query Service HTTP Handler    │
        │  - Validate input              │
        │  - Create GetUserQuery         │
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │    QueryService.GetUser()      │
        │  - Query from MongoDB          │
        │  - Return read model           │
        └────────────────┬───────────────┘
                         │
                         ▼
                      MongoDB
                   (Denormalized
                    read model)
                         │
                         ▼
        ┌────────────────────────────────┐
        │     Return User to Client      │
        │  - Optimized read model        │
        │  - Fast response               │
        └────────────────────────────────┘
```

## Code Structure

### Commands Layer

**File:** `internal/command/create_user.go`

```go
// Command definition
type CreateUserCommand struct {
    ID    string
    Name  string
    Email string
}

// Command handler
type CommandService struct {
    db    *gorm.DB
    ch    *amqp091.Channel
    queue string
}
```

**Responsibilities:**

- Define command structure
- Execute business logic
- Persist changes to database
- Publish events

### Queries Layer

**File:** `internal/query/queries.go` & `internal/query/service.go`

```go
// Query definition
type GetUserQuery struct {
    ID string
}

// Query handler
type QueryService struct {
    collection *mongo.Collection
}
```

**Responsibilities:**

- Define query structure
- Execute read operations
- Return optimized results
- NO side effects

### Domain Entities

**File:** `internal/domain/user.go`

```go
type User struct {
    ID        string
    Name      string
    Email     string
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

**Responsibilities:**

- Define domain model
- Ensure business logic consistency
- Used by both command and event handling

### Events

**File:** `internal/event/user_event.go`

```go
type Event struct {
    EventType   EventType
    EventID     string
    AggregateID string
    Timestamp   time.Time
    Data        map[string]interface{}
}
```

**Event Types:**

- `UserCreatedEvent`: User created
- `UserUpdatedEvent`: User updated
- `UserDeletedEvent`: User deleted

### HTTP Handlers

**Command Handlers:** `internal/handler/command_handler.go`

- `CreateUserHandler`: POST /users
- `UpdateUserHandler`: PUT /users/{id}
- `DeleteUserHandler`: DELETE /users/{id}

**Query Handlers:** `internal/handler/query_handler.go`

- `GetUserHandler`: GET /users/{id}
- `GetAllUsersHandler`: GET /users
- `GetUserByEmailHandler`: GET /users/search/email

## Consistency Models

### Strong Consistency

- **Write Side**: PostgreSQL provides ACID guarantees
- Commands are immediately durable and consistent

### Eventual Consistency

- **Read Side**: MongoDB is updated asynchronously
- After an event is processed, read models are consistent
- Small window of inconsistency between write and read

## Error Handling

### Command Errors

- Database errors return 500 Internal Server Error
- Validation errors return 400 Bad Request
- Not found errors return 404 Not Found

### Query Errors

- Database errors return 500 Internal Server Error
- Not found errors return 404 Not Found
- No validation errors (queries are safe)

## Performance Considerations

### Write Optimization

- PostgreSQL is ACID-compliant (slower but safe)
- Normalized schema reduces redundancy
- Suitable for frequent updates

### Read Optimization

- MongoDB allows denormalized documents
- Queries can be optimized per use case
- Suitable for fast lookups
- Can be further optimized with indexes

## Scaling Strategy

### Command Service Scaling

- **Horizontal**: Add more command service instances
- **Load Balancing**: Distribute write requests
- **Database**: PostgreSQL can handle concurrent writes
- **Bottleneck**: Database connections

### Query Service Scaling

- **Horizontal**: Add multiple query service instances
- **Load Balancing**: Distribute read requests
- **Database**: MongoDB scales well for reads
- **Caching**: Add Redis for frequently accessed data

### Event Bus Scaling

- **RabbitMQ Clustering**: For high availability
- **Event Partitioning**: Partition events by aggregate
- **Consumer Groups**: Multiple consumers per queue

## Testing Strategy

### Command Service Tests

```go
// Test command execution
// Test event publishing
// Test error handling
```

### Query Service Tests

```go
// Test query execution
// Test data retrieval
// Test event consumption
```

### Integration Tests

```go
// Test command → event → query flow
// Test eventual consistency
// Test error scenarios
```

## Monitoring & Observability

### Key Metrics

- Commands processed per second
- Event publishing latency
- Event consumption latency
- Read model update lag
- Query response time
- Error rates

### Logging Strategy

- Command execution logs
- Event publishing logs
- Event consumption logs
- Error and exception logs

### Tracing

- Distributed tracing with context IDs
- Trace commands from creation to event publishing
- Trace events from publishing to consumption

## Deployment

### Development

```bash
docker-compose up -d
go run cmd/command-service/main.go &
go run cmd/query-service/main.go &
```

### Production

```bash
# Build Docker images
docker build -t cqrs-command -f Dockerfile.command .
docker build -t cqrs-query -f Dockerfile.query .

# Deploy with orchestration tool (Kubernetes, etc.)
```

## When to Use CQRS

### ✅ Good Fit

- Applications with different read/write patterns
- Systems requiring high scalability
- Complex domain logic requiring event sourcing
- Systems with eventual consistency requirements
- Microservices architectures
- Event-driven systems

### ❌ Not a Good Fit

- Simple CRUD applications
- Systems requiring strong consistency
- Small teams (increases complexity)
- Systems with limited scalability needs
- Real-time synchronization required

## Common Pitfalls

1. **Over-engineering**: Don't use CQRS if you don't need it
2. **Consistency Issues**: Remember eventual consistency window
3. **Event Versioning**: Plan for schema evolution
4. **Dead Letter Queues**: Handle failed event processing
5. **Monitoring**: Critical for tracking consistency lag
6. **Complexity**: Requires more infrastructure and expertise

## Future Enhancements

1. **Event Sourcing**: Store complete event history
2. **Snapshots**: Cache event stream snapshots
3. **Sagas**: Complex multi-aggregate transactions
4. **Event Versioning**: Handle schema evolution
5. **Projections**: Multiple read models
6. **Time Travel**: Query data at any point in time
7. **Analytics**: Event stream analysis

## References

- [Greg Young - CQRS](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- [Microsoft - CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Go Web Development Best Practices](https://golang.org/)
