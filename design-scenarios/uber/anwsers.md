# How to Structure This Problem With System Design

When discussing **maintainability and modularity—especially** using **Uber’s migration to microservices** we want to structure the explanation into clear system-design sections:

## 1. Problem Context

Uber started with a single monolithic application, which worked well at a small scale.
As the platform grew internationally, the monolith became:

- Hard to maintain
- Slow to deploy
- Risky to change (one bug could break critical flows)
- Difficult for teams to work independently
- This scaling constraint motivated the move to microservices.

## 2. Requirements

### Functional Needs

- Handle trips, drivers, payments, mapping, routing, surge pricing, etc.
- Independent development and deployment of each domain

### Non-Functional Needs

- Maintainability
- Modularity
- Scalability
- Fault isolation
- Reduced deployment risk
- Team autonomy

## 3. Why Monolith Became a Problem (Root Causes)

- Tight coupling between components
- High cognitive load for developers
- Single codebase with conflicting versioning needs
- Scaling required scaling everything, not just hot paths
- Long build and deployment cycles
- Testing became harder

## 4. Proposed Architecture: Microservices

**Key idea: Decompose by business domain**

- Trip Service
- Driver Match Service
- Pricing / Surge Service
- Payments Service
- Maps & Routing
- Notifications Service
- etc.

Each service is:

- Independently deployable
- Owned by a specific team
- Versioned separately
- Able to scale horizontally

## 5. System Design Challenges Introduced

Any good system-design answer includes trade-offs.

Microservices solve maintainability, but introduce new problems:

### Service Discovery

How does one service find another?

Solutions:

- [Consul](https://developer.hashicorp.com/consul)
- [ZooKeeper](https://zookeeper.apache.org/)
- [Envoy](https://www.envoyproxy.io/) + [Service Mesh](https://www.redhat.com/pt-br/topics/microservices/what-is-a-service-mesh)
- [Kubernetes internal DNS](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)

### Inter-Service Communication

Two patterns:

- Sync: REST/gRPC
- Async: Kafka/RabbitMQ

Problems:

- Network latency
- Retries
- Timeouts
- Circuit breaking

### Observability

Distributed systems need:

- Centralized logging
- Distributed tracing (Jaeger, Zipkin)
- Metrics dashboards

### Versioning

Different teams release features independently => Backwards compatibility becomes critical.

### Data Ownership & Consistency

Each service should own its data.

Problems:

- Distributed transactions (sagas)
- Eventual consistency
- Duplication of some data
