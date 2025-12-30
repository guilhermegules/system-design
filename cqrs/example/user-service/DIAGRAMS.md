# CQRS System Diagrams

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                         │
└───────────────┬─────────────────────────────────┬───────────────────┘
                │ Write Operations                │ Read Operations
                │ (Commands)                      │ (Queries)
                ▼                                 ▼
        ┌───────────────────┐          ┌──────────────────┐
        │  Command Service  │          │  Query Service   │
        │   (Port 8080)     │          │   (Port 8081)    │
        │                   │          │                  │
        │  - CreateUser     │          │  - GetUser       │
        │  - UpdateUser     │          │  - GetAllUsers   │
        │  - DeleteUser     │          │  - SearchByEmail │
        └────────┬──────────┘          └────────┬─────────┘
                 │                              ▲
                 │ Persist                      │ Query
                 ▼                              │
        ┌────────────────┐                      │
        │  PostgreSQL    │                      │
        │  (Write DB)    │                      │
        │                │                      │
        │  - users       │                      │
        └────────┬───────┘                      │
                 │                              │
                 │ Publish Event                │
                 ▼                              │
        ┌────────────────────────────────┐      │
        │      RabbitMQ Event Bus        │      │
        │    (user_events queue)         │─────┤
        │                                │      │ Consume Event
        │  - user.created                │      │
        │  - user.updated                │      │
        │  - user.deleted                │      │
        └────────────────────────────────┘      │
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │   MongoDB    │
                                        │  (Read DB)   │
                                        │              │
                                        │  - users     │
                                        └──────────────┘
```

## 2. Command Flow (Write Operation)

```
User Creates Data:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  POST /users                                                    │
│  {                                                              │
│    "name": "John Doe",                                          │
│    "email": "john@example.com"                                  │
│  }                                                              │
│                                                                 │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Command Service Handler            │
│   - Validates input                  │
│   - Creates command object           │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   CommandService.CreateUser()        │
│   - Validates business rules         │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Database Operation                 │
│   - Inserts into PostgreSQL          │
│   - Generates UUID for user          │
│   - Sets created_at timestamp        │
└───────────┬──────────────────────────┘
            │
            ├─────────────────────────────────┐
            │                                 │
            ▼                                 ▼
        Returns              Publishes UserCreatedEvent
        to Client            to RabbitMQ

        {                     {
          "message":            "event_type": "user.created",
          "User created",       "aggregate_id": "uuid",
          "user_id": "uuid"     "timestamp": "2025-12-30T...",
        }                       "data": {
                                  "user_id": "uuid",
                                  "name": "John Doe",
                                  "email": "john@example.com"
                                }
                              }
                              │
                              ▼
                        ┌─────────────────┐
                        │  RabbitMQ Queue │
                        │  user_events    │
                        └────────┬────────┘
                                 │
                                 ▼ Event Consumed
                        ┌─────────────────┐
                        │ Query Service   │
                        │ EventConsumer   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   MongoDB       │
                        │   Update Read   │
                        │   Model         │
                        └─────────────────┘
```

## 3. Query Flow (Read Operation)

```
User Requests Data:
┌────────────────────────────────────────┐
│                                        │
│  GET /users/{id}                      │
│                                        │
└───────────┬────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Query Service Handler              │
│   - Validates input                  │
│   - Creates query object             │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   QueryService.GetUser()             │
│   - Builds MongoDB query             │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   MongoDB Read Operation             │
│   - Queries denormalized read model  │
│   - Returns optimized document       │
└───────────┬──────────────────────────┘
            │
            ▼
        ┌──────────────────────┐
        │  Returns User to     │
        │  Client              │
        │                      │
        │  {                   │
        │    "_id": "uuid",    │
        │    "name": "John..", │
        │    "email": "j@..",  │
        │    "created_at": "..│
        │    "updated_at": "..│
        │  }                   │
        └──────────────────────┘
```

## 4. Event Processing Pipeline

```
┌──────────────────────────────────────────────────────────┐
│              Event Processing Pipeline                   │
└──────────────────────────────────────────────────────────┘

Step 1: Event Creation (Command Service)
    ┌─────────────────────────────────┐
    │ Domain Operation Executed       │
    │ (User created/updated/deleted)  │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Event Object Created            │
    │ with complete state             │
    └────────────┬────────────────────┘
                 │
Step 2: Event Publishing
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Event Serialized to JSON        │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Published to RabbitMQ           │
    │ user_events queue               │
    └────────────┬────────────────────┘
                 │
Step 3: Event Distribution
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Message Broker (RabbitMQ)       │
    │ - Durable queue                 │
    │ - Persistent messages           │
    │ - Guaranteed delivery           │
    └────────────┬────────────────────┘
                 │
Step 4: Event Consumption
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Event Consumer                  │
    │ (Query Service)                 │
    │ - Listens to queue              │
    │ - Receives event                │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Event Deserialized              │
    │ from JSON to Object             │
    └────────────┬────────────────────┘
                 │
Step 5: Read Model Update
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Event Handler Dispatched        │
    │ - Route to correct handler      │
    │ - Based on event type           │
    └────────────┬────────────────────┘
                 │
        ┌────────┴────────┬────────────┐
        │                 │            │
        ▼                 ▼            ▼
    UserCreated    UserUpdated    UserDeleted
    Handler        Handler         Handler
        │              │              │
        │              │              │
        ├──────────────┴──────────────┤
        │                             │
        ▼                             ▼
    MongoDB Insert            MongoDB Update/Delete
        │                             │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Read Model Updated          │
        │ - Denormalized document     │
        │ - Optimized for queries     │
        │ - Ready for retrieval       │
        └─────────────────────────────┘
```

## 5. Service Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                  Command Service                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dependencies:                                          │
│  ├── PostgreSQL ............ Write Database            │
│  ├── RabbitMQ .............. Event Publishing          │
│  └── Go net/http ........... HTTP Server              │
│                                                          │
│  Handlers:                                              │
│  ├── CreateUserHandler .... POST /users               │
│  ├── UpdateUserHandler .... PUT /users/{id}           │
│  └── DeleteUserHandler .... DELETE /users/{id}        │
│                                                          │
│  Services:                                              │
│  └── CommandService                                     │
│      ├── CreateUser()                                   │
│      ├── UpdateUser()                                   │
│      ├── DeleteUser()                                   │
│      └── publishEvent()                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘

                        ▲
                        │ Events
                        │ (async)
                        │
                    ┌───┴────────────────────────────────┐
                    │                                    │
                    │          RabbitMQ                  │
                    │                                    │
                    └───┬────────────────────────────────┘
                        │
                        │ Events
                        │ (async)
                        ▼

┌─────────────────────────────────────────────────────────┐
│                   Query Service                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dependencies:                                          │
│  ├── MongoDB .............. Read Database              │
│  ├── RabbitMQ ............. Event Consumption          │
│  └── Go net/http .......... HTTP Server               │
│                                                          │
│  Handlers:                                              │
│  ├── GetUserHandler ....... GET /users/{id}            │
│  ├── GetAllUsersHandler ... GET /users                 │
│  └── SearchUserHandler .... GET /users/search/email    │
│                                                          │
│  Services:                                              │
│  ├── QueryService                                       │
│  │   ├── GetUser()                                      │
│  │   ├── GetAllUsers()                                  │
│  │   └── GetUserByEmail()                               │
│  │                                                       │
│  └── EventConsumer                                      │
│      ├── Start()                                        │
│      ├── handleUserCreated()                            │
│      ├── handleUserUpdated()                            │
│      └── handleUserDeleted()                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 6. Data Flow for Update Operation

```
User Update Timeline:

T=0ms: Client sends PUT request
       PUT /users/123
       {"name": "Jane", "email": "jane@example.com"}
             │
             ▼
T=1ms: Command Service receives request
       - Validates input
       - Creates UpdateUserCommand
             │
             ▼
T=2ms: CommandService.UpdateUser() executes
       - Fetches existing user from PostgreSQL
       - Updates user data
       - Saves to PostgreSQL (ACID transaction)
             │
             ├─────────────────────────┐
             │                         │
             ▼                         ▼
        DB Updated              Creates Event
        {updated_at: T2}         {type: updated}
             │                         │
             │                         ▼
             │                   ┌──────────────┐
             │                   │ Serializes   │
             │                   │ to JSON      │
             │                   └──────┬───────┘
             │                          │
T=5ms: Returns to Client        ┌──────▼────────┐
       {status: 200,             │ Publishes to  │
        message: updated,        │ RabbitMQ      │
        user_id: 123}            └──────┬────────┘
             │                          │
             │                   ┌──────▼────────┐
             │ ✓ Response sent   │ Event queued  │
             │ (immediate)       │ in queue      │
             │                   └──────┬────────┘
             │                          │
             │                   ┌──────▼────────┐
T=100ms:     │               │ EventConsumer  │
             │               │ detects event  │
             │               └──────┬────────┘
             │                      │
             │               ┌──────▼────────┐
             │               │ Deserialize   │
             │               │ event         │
             │               └──────┬────────┘
             │                      │
             │               ┌──────▼────────┐
             │               │ Route to      │
             │               │ handler       │
             │               └──────┬────────┘
             │                      │
             │               ┌──────▼────────┐
             │               │ Update        │
             │               │ MongoDB read  │
             │               │ model         │
             │               └──────┬────────┘
             │                      │
             │                      ▼
T=110ms:     │                ✓ Read model
             │                  updated
             │
             └──────────────────────────────────▶ ✓ CONSISTENCY ACHIEVED
                                                  Write model: Updated (T=2ms)
                                                  Read model: Updated (T=110ms)
                                                  Lag: ~108ms
```

## 7. Component Interactions

```
┌──────────────────────────────────────────────────────────────┐
│                     Request Processing                       │
└──────────────────────────────────────────────────────────────┘

COMMAND FLOW:
─────────────────────────────────────────────────────────────

Client
  │
  ├──> handler/command_handler.go (HTTP)
  │        │
  │        ├──> Validates input
  │        │
  │        └──> Creates Command
  │                │
  │                ▼
  │        command/service.go (Business Logic)
  │        - CommandService
  │
  │        ├──> Executes operation
  │        │
  │        ├──> Calls database/postgres.go
  │        │    - GORM ORM
  │        │    - Saves domain entity
  │        │
  │        ├──> Creates domain/event
  │        │
  │        └──> Calls database/rabbitmq.go
  │             - AMQP Publisher
  │             - Publishes event


QUERY FLOW:
─────────────────────────────────────────────────────────────

Client
  │
  ├──> handler/query_handler.go (HTTP)
  │        │
  │        ├──> Validates input
  │        │
  │        └──> Creates Query
  │                │
  │                ▼
  │        query/service.go (Data Access)
  │        - QueryService
  │
  │        └──> Calls database/mongodb.go
  │             - MongoDB Driver
  │             - Queries read model
  │             - Returns denormalized data


EVENT CONSUMPTION:
─────────────────────────────────────────────────────────────

database/rabbitmq.go (Connection)
  │
  └──> RabbitMQ (Message Broker)
         │
         └──> user_events queue
                │
                ▼
         query/event_consumer.go
         - EventConsumer
         - Listens to queue
         - Receives messages
         - Deserializes JSON
         - Routes to handlers
         - updateUserReadModel()
         │
         └──> database/mongodb.go
              - MongoDB Driver
              - Inserts/Updates/Deletes
              - Maintains consistency
```

## 8. Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Handler Layer                    Handler Layer             │
│  ├─ CreateUserHandler             ├─ GetUserHandler        │
│  ├─ UpdateUserHandler             ├─ GetAllUsersHandler    │
│  └─ DeleteUserHandler             └─ SearchUserHandler     │
└────────────┬────────────────────────────┬──────────────────┘
             │                            │
        ┌────▼─────────┐        ┌────────▼────────┐
        │ Service Layer│        │ Service Layer   │
        ├──────────────┤        ├─────────────────┤
        │CommandService│        │ QueryService    │
        └────────┬─────┘        │ EventConsumer   │
                 │              └────────┬────────┘
        ┌────────▼──────────────────────▼──────────┐
        │      Infrastructure Layer                │
        ├──────────────────────────────────────────┤
        │ PostgreSQL    RabbitMQ      MongoDB      │
        │  (GORM ORM) (AMQP Driver) (Go Driver)   │
        └──────────────────────────────────────────┘

        External Dependencies:
        ├── github.com/google/uuid ........... ID generation
        ├── gorm.io/driver/postgres ......... PostgreSQL ORM
        ├── gorm.io/gorm .................... ORM core
        ├── github.com/rabbitmq/amqp091-go . AMQP client
        └── go.mongodb.org/mongo-driver/mongo MongoDB client
```

---

These diagrams provide visual representations of:

1. Overall system architecture
2. Command processing flow
3. Query processing flow
4. Event distribution pipeline
5. Service dependencies
6. Update operation timeline
7. Component interactions
8. Technology stack
