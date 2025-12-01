# Data Persistence and Modeling

Database choices and modeling for scale:
- SQL vs. NoSQL Trade-offs:
    - NoSQL (e.g., MongoDB): Excels at horizontal scaling, flexibility for semi-structured data, and high-volume access (reading). It typically offers eventual consistency.
    - Relational: Provides strong consistency and supports ACID transactions but may be less efficient for highly scalable or unstructured data.
- High Availability & Resilience: Implementing Replica Sets (for failover) and Sharding (for distributing data) in databases like MongoDB.
- Data Modeling: Designing the schema based on the most frequent query (query-driven design), using adequate indexing, denormalization to avoid expensive joins, and embedded documents (especially in NoSQL for social feeds)

## SQL vs. NoSQL — Trade-offs Explained

### Data Model & Structure

SQL (Relational)

- Fixed schema (tables, columns, types)
- Great for structured, predictable data
- Enforces relationships (FKs, constraints, normalization)

NoSQL (Document, Key-Value, Columnar, Graph)

- Schema-flexible or schema-less
- Best for semi-structured or evolving data
- Often maps more naturally to app domain objects (e.g., JSON docs in MongoDB)

### Consistency & Transactions

SQL

- Strong consistency
- Full ACID transactions supported natively
- Ensures correctness: banking, inventory, booking systems

NoSQL

- Many NoSQL systems favor eventual consistency (though some offer tunable consistency: MongoDB, Cassandra, DynamoDB)
- Transactions are limited or more complex (MongoDB has multi-doc txn but less optimized)
- Trades some consistency guarantees for speed or scalabilit

### Scalability

SQL

- Traditionally vertically scalable (scale-up)
- Modern SQL databases can scale horizontally:
- Read replicas
- Sharding (harder and more operationally complex)
- Distributed SQL (CockroachDB, Yugabyte, TiDB)

NoSQL

- Built for horizontal scaling (scale-out):
- Automatic sharding
- Replication built-in
- Handles very large write/read throughput

### Query Flexibility 

SQL

- Rich, standardized query language (SQL)
- Complex joins, filters, aggregates, subqueries
- Ideal for relational queries and analytics

NoSQL

- Query ops vary by database type:
- MongoDB: rich document queries and indexing
- Cassandra: query flexibility limited by partition keys
- Redis: key lookups, sets, sorted sets (very fast)
- Joins often discouraged or unsupported; denormalization is common

### Performance

SQL

- Optimized for complex queries and relationships
- Joins and transactions can become expensive at huge scale

NoSQL

- Optimized for high-volume, low-latency reads/writes
- Denormalization improves read performance
- Trades flexibility/consistency for speed

### Use Cases

When to choose SQL

- Financial applications
- Inventory, booking, reservations
- Complex relational data
- Need for strongly consistent transactions
- Strict schemas

When to choose NoSQL

- High read/write throughput
- Event logs, analytics pipelines
- Content management, product catalogs
- IoT, time-series (Cassandra/Influx)
- Rapidly evolving schemas
- Distributed systems requiring horizontal scalability

## High Availability & Resilience

### Replica Sets — purpose & how they provide HA

What they do

- Maintain multiple copies of data across members (primary + secondaries).
- If primary fails, an automatic election promotes a secondary to primary -> continuous write availability.
- Oplog-based replication (oplog on primary is replayed on secondaries).

Key concepts

- Primary: accepts writes.
- Secondary: replicates oplog, can serve reads if configured.
- Arbiter: participates in elections but stores no data (used to provide quorum when deploying an even number of data-bearing nodes).
- Priority / hidden / votes: tune promotion likelihood and visibility.
- WriteConcern: e.g., w: "majority" ensures write durability across replicas.
- ReadConcern / ReadPreference: control consistency vs. latency (e.g., primary, primaryPreferred, secondaryPreferred, nearest).

### Sharding — purpose & how it provides horizontal scale & resilience

What it does

- Splits data across multiple shards; each shard is typically a replica set (so shards are resilient).
- Distributes read/write load and storage across many machines.

Components

- Shards: hold data (usually replica sets).
- Config servers: hold metadata about the cluster (three config servers recommended, they must be replica sets).
- Mongos: query routers used by applications to communicate with the sharded cluster.

Shard key selection

- Most important decision — affects distribution, performance, and hotspotting.
- Prefer keys that:
  - Provide high cardinality (many distinct values)
  - Are evenly distributed across space/time
  - Allow queries to be targeted to a subset of shards (avoid scatter-gather)
- Avoid monotonically increasing keys (e.g., timestamps, ObjectId prefix) unless paired with a compound key that includes a hashed or more random component.

Sharding modes

- Range sharding: good for range queries if shard key sorts match query patterns.
- Hashed sharding: good to evenly distribute writes for single-field keys (but poor for range queries).

Balancer & chunk migration

- Cluster splits data into chunks based on shard key ranges. The balancer moves chunks to achieve even distribution.
- Monitor chunk migration, and pause balancer during heavy load or maintenance if needed.

### Combining Replica Sets + Sharding

- Each shard should be a replica set so data on that shard is highly available.
- Config servers should be run as a 3-node replica set for resilience.
- Run multiple mongos instances (stateless) and put them behind a load balancer or let application connect to multiple mongos endpoints.

### Consistency, Transactions & Multi-Shard Writes

- Transactions spanning multiple shards are supported (since MongoDB 4.2), but they have more overhead.
- Prefer designing the schema to keep most multi-document transactions within a single shard (shard-local).
- Use readConcern and writeConcern appropriately (majority) to ensure safety in failure scenarios.

### Common pitfalls & how to avoid them

- Bad shard key -> hotspotting and uneven load. Use hashed keys or better compound keys.
- Too small oplog -> secondaries fall behind and require resync.
- Not using majority writeConcern for critical data -> risk of lost writes during failover.
- Relying on arbiters in production -> they provide quorum but no data; bad for durability.
- Overloading mongos: mongos is lightweight but should be scaled and colocated near application tier.
