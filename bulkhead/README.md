# Bulkhead Pattern

The name comes from ships.

Ships have bulkheads (watertight compartments). If one compartment floods the ship **doesn’t sink**, because water is contained.

Software idea: **Isolate resources so a failure in one part doesn’t bring down everything.**

The official definition from [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead) says the pattern “isolates elements into pools so if one fails, others continue to function.”

## The Real Problem It Solves - Cascading Failure

Imagine a service calling multiple downstream services:

```
Frontend → API Gateway → Order Service
                          ↙        ↘
                    Payment     Inventory
```

Now imagine:

- Payment becomes slow or hangs
- Threads/connections waiting for Payment don’t get released
- Thread pool gets exhausted
- Order service cannot call Inventory anymore
- System appears “fully down” even though only Payment is broken
- This is called resource exhaustion, cascading failure.

## The Core Idea

Instead of sharing resources globally: You create **separate resource pools (bulkheads)**.

Examples of resources:
- Thread pools
- Connection pools
- Containers/pods
- Queues
- CPU/memory limits
- Service instances

So if one pool dies others still work.

## When To Apply Bulkhead

### Service calls multiple dependencies

Classic microservices scenario.

Example:

- Payment API
- Shipping API
- Email API
- Fraud API

If one dependency is unreliable then use bulkhead.

### You have critical vs non-critical features

| Feature             | Criticality     |
| ------------------- | --------------- |
| Checkout            | 🔴 Critical     |
| Recommendations     | 🟡 Nice to have |
| Email notifications | 🟢 Optional     |


Bulkhead lets recommendations fail without breaking checkout.

### Multi-tenant or heavy clients

Example:

- Client A sends 10x more traffic
- Without bulkhead they starve others
- Bulkhead = per-tenant pools.

### Any system that must degrade gracefully

Bulkhead enables: Partial failure instead of total failure.

## When NOT to Use

Tradeoff:

- More complexity
- Some wasted resources
- Harder scaling

Not worth it for:
- Small apps
- Monoliths

## Types of Bulkheads

### Consumer-side bulkhead

Separate resources per dependency.

- Thread pool for Payment calls
- Thread pool for Inventory calls
- Thread pool for Email calls


This prevents a slow dependency from blocking others.

### Service-side bulkhead

Separate service instances.

Payment Service: 
- Instance pool A => Premium users
- Instance pool B => Free users
