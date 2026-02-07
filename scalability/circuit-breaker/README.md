# Circuit Breaker

A minimal implementation of the Circuit Breaker pattern inspired by [Martin Fowler’s article](https://martinfowler.com/bliki/CircuitBreaker.html).
This project demonstrates how to protect your application from cascading failures when calling unstable or slow remote services.

## What is a Circuit Breaker?

A Circuit Breaker is a resilience pattern used when calling external systems (APIs, databases, microservices).

Remote calls can:

- fail repeatedly
- become slow or unresponsive
- cause cascading failures across the system

Instead of continuously retrying a failing service, the Circuit Breaker **stops calls temporarily**, allowing the system to recover.

## How the Pattern Works

The circuit has three states:

### 🟢 CLOSED (Normal operation)

Requests flow normally.

- Calls are executed.
- Failures are counted.
- If failures exceed a threshold → circuit opens.

### 🔴 OPEN (Fail fast)

The service is considered unhealthy.

- No calls are executed.
- Requests fail immediately.
- After a timeout → circuit moves to HALF-OPEN.

This prevents:

- thread exhaustion
- resource waste
- cascading failures

### 🟡 HALF-OPEN (Recovery test)

The circuit allows a small number of test requests.

- If requests succeed → circuit closes.
- If a request fails → circuit opens again.

This state checks if the remote service has recovered.

## Running the Project

Install dependencies:

```
npm install
```

Running the project:

```
npm start
```
