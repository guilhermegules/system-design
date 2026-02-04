# Splitting a Legacy Relational Database in Two

How would you split a legacy relational database into two databases such that records from the last 6 months remain in one database, while older records are moved to another?

This problem is less about SQL and more about **architecture, performance, and user experience**. 

## Define the Goal First

Before choosing a technical solution, clarify what you are optimizing for:

- Query performance on frequently accessed data
- Storage and infrastructure cost
- Operational risk and data safety

- Maintainability of a large legacy system

General principle:

- **Recent data = high access frequency → primary database**
- **Older data = low access frequency → historical database**

## High-Level Architecture

The safest and most common approach is:

**Split data physically, but hide that split from the application.**

The application should not need to know which database stores the data. That logic belongs in the data access layer.

```
Application
   |
   |— Repository / Service Layer
           |
           |— Active DB (≤ 6 months)
           |— Historical DB (> 6 months)
```

## Data Separation Strategies

### Option 1 — Two Databases, Time-Based Routing (Most Common)

Active database: last 6 months of data

Historical database: data older than 6 months

Rules:

- INSERT -> always into the active database
- READ -> routed based on date filters
- UPDATE/DELETE -> typically disabled or heavily restricted on historical data

Pros:

- Simple and explicit
- Easy to reason about

Cons:

- Queries must be time-aware

### Option 2 — Read-Only Historical Database

- Historical database is read-only
- Minimal indexing
- Cheaper storage tier

Ideal for:

- Auditing
- Reporting
- Compliance

This increases safety and predictability.

### Option 3 — Native Table Partitioning (If Available)

If the database supports it (PostgreSQL, MySQL, Oracle):

- PARTITION BY RANGE (created_at)
- Monthly partitions
- Old partitions can be moved to slower storage or archived

Pros:

- Transparent to the application
- No cross-database queries

Cons:

- Migration can be complex in legacy systems
- Not a true physical separation

## Summary 

I would split the database by time, keeping recent data in an active database and older data in a read-only historical database. 
The application would abstract this split via the data access layer, use cursor-based pagination, explicit date filters for search, and automated migration jobs to maintain performance and usability.
