# CQRS - Command Query Responsibility Segregation

## 1. The Core Split: Commands vs Queries

The fundamental principle is that every operation should be either a command or a query, but never both.

- Commands: These represent write operations. They should be task based (e.g, "Book hotel room" rather than "update status to 2"). Commands change the state of the system and do not return data (except perhaps some metadata like an ID or success status).
- Queries: These represent read operations. They only retrieve data and are strictly side-effect-free (They never change the state of the system). They typically return data transfer Objects (DTOs) tailored to the UI.

## 2. Separation of models

Unlike traditional CRUD (Create, Read, Update, Delete) where the same data model is used for everything, CQRS uses separate models:

- Write model: optimized for complex business logic, validation, transaction integrity. It often follows Domain-Driven Design (DDD) patterns like _Aggregates_.
- Read model: optimized for the presentation layer. It avoids complex joins and business logic, often using "materialized views" or flattened data structures to make queries as fast as possible.

## 3. Deployment & Scaling

CQRS allows for independent optimization of the read and write sides

- Independent scaling: if your application has 10,000 reads for every 1 write, you can scale the read-side infrastructure (like adding more read replicas) without affecting the write-side
- Different databases: while not required, advanced CQRS often uses different databases for each side (e.g, a relational databases for writes and a NoSQL or cache for reads).

## 4. Eventual consistency

When you separate the database for reads and writes, they must be kept in sync. This is usually done via **asynchronous messaging**

1. A command updates the write databases
2. The system publishes an Event
3. An event handler updates the Read Database. Because this happens in the background, the read databases might be slightly "stale" for a fraction of a second, this is known as **Eventual Consistency**.

## 5. Benefits and Challenges

Benefits:

- Performance: Read queries are simples and faster because they don't have to perform complex joins and filtering
- Security: You can more easily ensure that only the right users can execute specific commands
- Separation of Concerns: Business logic is kept away from UI-specific data requirements

Challenges:

- Complexity: It adds more moving parts (messages, separate models, sync logic) to the system
- Messaging failures: Handling duplicates messages or failed updates to the read store requires careful engineering
- Stale data: The UI must be designed to handle the fact that data might not be updated instantly

## When to use it?

The [documentation](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) suggests CQRS is the best for complex domains where the business logic for writes is significant different from the requirements for reads.

## References

- [Greg Young - CQRS](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- [Microsoft - CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Go Web Development Best Practices](https://golang.org/)
