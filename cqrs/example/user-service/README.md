# CQRS Pattern Implementation

A complete implementation of the **Command Query Responsibility Segregation (CQRS)** pattern in Go with event-driven synchronization between write and read models.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Clients                              │
└──────────────┬──────────────────────────────┬────────────────┘
               │ Write Operations             │ Read Operations
               ▼                              ▼
        ┌──────────────┐            ┌─────────────────┐
        │   Command    │            │     Query       │
        │   Service    │            │     Service     │
        │   (Port 8080)│            │    (Port 8081)  │
        └──────────────┘            └─────────────────┘
               │                            ▲
               │ Publish Events             │ Subscribe
               │                            │
        ┌──────▼────────────────────────────┴──────┐
        │         RabbitMQ Event Bus                │
        │       (user_events queue)                 │
        └──────────────────────────────────────────┘
               │
               │ Event Consumption
               ▼
        ┌──────────────┐            ┌─────────────────┐
        │  PostgreSQL  │            │     MongoDB     │
        │  (Write DB)  │            │    (Read DB)    │
        │   - Users    │            │  - User Models  │
        └──────────────┘            └─────────────────┘
```

## Project Structure

```
.
├── cmd/
│   ├── command-service/      # Write service (Command Handler)
│   │   └── main.go
│   └── query-service/        # Read service (Query Handler)
│       └── main.go
├── internal/
│   ├── command/              # Command definitions & services
│   │   ├── create_user.go
│   │   ├── service.go        # CommandService
│   │   └── user.go           # (deprecated)
│   ├── database/             # Database connections
│   │   ├── postgres.go
│   │   ├── mongodb.go
│   │   └── rabbitmq.go
│   ├── domain/               # Domain entities
│   │   └── user.go
│   ├── event/                # Domain events
│   │   └── user_event.go
│   ├── handler/              # HTTP handlers
│   │   ├── command_handler.go
│   │   └── query_handler.go
│   └── query/                # Query definitions & services
│       ├── event_consumer.go # EventConsumer
│       ├── model.go          # Read models
│       ├── queries.go        # Query definitions
│       ├── service.go        # QueryService
│       └── user.go           # (deprecated)
├── docker-compose.yaml       # Infrastructure setup
├── go.mod
└── README.md
```

## Key Components

### 1. **Domain Layer** (`internal/domain/`)

- **User Entity**: Core domain model representing a user in the system
- Single source of truth for business logic

### 2. **Command Layer** (`internal/command/`)

- **Commands**: `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`
- **CommandService**: Handles write operations to PostgreSQL
  - Executes commands
  - Publishes domain events to RabbitMQ
  - Ensures ACID properties on write database

### 3. **Query Layer** (`internal/query/`)

- **Queries**: `GetUserQuery`, `GetAllUsersQuery`, `GetUserByEmailQuery`
- **QueryService**: Handles read operations from MongoDB
  - Retrieves denormalized read models
  - Optimized for query performance
- **EventConsumer**: Listens to domain events
  - Updates read models in MongoDB
  - Maintains eventual consistency

### 4. **Event System** (`internal/event/`)

- **Events**: `UserCreatedEvent`, `UserUpdatedEvent`, `UserDeletedEvent`
- **Event Bus**: RabbitMQ integration for async communication
- Events contain all data needed to reconstruct read models

### 5. **HTTP Handlers** (`internal/handler/`)

- **Command Handlers**: Create, update, delete users
- **Query Handlers**: Get user, get all users, search by email

### 6. **Infrastructure** (`internal/database/`)

- PostgreSQL connection pool (Write DB)
- MongoDB connection (Read DB)
- RabbitMQ connection (Event Bus)

## CQRS Pattern Benefits

✅ **Separation of Concerns**: Write and read logic are completely separate
✅ **Performance**: Optimized databases for writes (ACID) and reads (denormalized)
✅ **Scalability**: Services can be scaled independently
✅ **Flexibility**: Read models can be denormalized for specific query patterns
✅ **Event Sourcing Ready**: Fully prepared for event sourcing implementation
✅ **Eventual Consistency**: Maintains consistency through events

## API Endpoints

### Command Service (Port 8080)

#### Create User

```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

Response: 201 Created
{
  "message": "User created successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Update User

```bash
PUT /users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

Response: 200 OK
{
  "message": "User updated successfully",
  "user_id": "{id}"
}
```

#### Delete User

```bash
DELETE /users/{id}

Response: 200 OK
{
  "message": "User deleted successfully",
  "user_id": "{id}"
}
```

### Query Service (Port 8081)

#### Get User by ID

```bash
GET /users/{id}

Response: 200 OK
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-12-30T10:15:30Z",
  "updated_at": "2025-12-30T10:15:30Z"
}
```

#### Get All Users

```bash
GET /users?limit=10&offset=0

Response: 200 OK
[
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    ...
  }
]
```

#### Search User by Email

```bash
GET /users/search/email?email=john@example.com

Response: 200 OK
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  ...
}
```

## Event Flow

### Create User Flow:

```
1. Client sends POST /users request to Command Service
2. CommandService.CreateUser() is invoked
3. User is saved to PostgreSQL
4. UserCreatedEvent is published to RabbitMQ
5. EventConsumer receives the event
6. Read model is inserted into MongoDB
7. Query Service can now retrieve the user
```

### Update User Flow:

```
1. Client sends PUT /users/{id} request to Command Service
2. CommandService.UpdateUser() is invoked
3. User is updated in PostgreSQL
4. UserUpdatedEvent is published to RabbitMQ
5. EventConsumer receives the event
6. Read model is updated in MongoDB
7. Updated user is immediately available for queries
```

### Delete User Flow:

```
1. Client sends DELETE /users/{id} request to Command Service
2. CommandService.DeleteUser() is invoked
3. User is deleted from PostgreSQL
4. UserDeletedEvent is published to RabbitMQ
5. EventConsumer receives the event
6. Read model is deleted from MongoDB
```

## Setup & Running

### Prerequisites

- Docker & Docker Compose
- Go 1.25+

### Start Infrastructure

```bash
docker-compose up -d
```

This starts:

- PostgreSQL (Port 5432)
- MongoDB (Port 27017)
- RabbitMQ (Port 5672, Management: 15672)

### Build & Run Services

#### Command Service

```bash
go run cmd/command-service/main.go
```

#### Query Service

```bash
go run cmd/query-service/main.go
```

### Testing the System

```bash
# Create a user
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Wait a moment for event processing
sleep 1

# Query the user
curl http://localhost:8081/users/search/email?email=john@example.com
```

## Database Schemas

### PostgreSQL (Write DB)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### MongoDB (Read DB)

```javascript
db.users.insertOne({
  _id: ObjectId,
  name: String,
  email: String,
  created_at: Date,
  updated_at: Date,
});
```

## Technology Stack

- **Language**: Go 1.25+
- **Write Database**: PostgreSQL (ACID properties)
- **Read Database**: MongoDB (Denormalized read models)
- **Message Broker**: RabbitMQ (Event distribution)
- **ORM**: GORM (PostgreSQL)
- **MongoDB Driver**: Go MongoDB driver
- **AMQP**: github.com/rabbitmq/amqp091-go

## Future Enhancements

1. **Event Sourcing**: Store all events as the source of truth
2. **Event Versioning**: Handle schema evolution
3. **Saga Pattern**: Complex transactions across aggregates
4. **CQRS with Projections**: Multiple read models for different query patterns
5. **Event Replay**: Rebuild read models from events
6. **Distributed Tracing**: Add OpenTelemetry for observability
7. **Caching Layer**: Redis cache for frequently accessed reads
8. **Authentication**: JWT or OAuth2 integration

## Troubleshooting

### Events not syncing to MongoDB

1. Check RabbitMQ is running: `docker-compose logs rabbitmq`
2. Verify queue is created: Check RabbitMQ management UI at `localhost:15672`
3. Check event consumer logs in query service

### PostgreSQL connection errors

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Verify connection string in command service
POSTGRES_DSN="user=user password=password dbname=write_db host=localhost port=5432 sslmode=disable"
```

### MongoDB connection errors

```bash
# Check MongoDB is running
docker-compose logs mongodb

# Verify connection string in query service
MONGODB_URI="mongodb://localhost:27017"
```

## License

MIT
