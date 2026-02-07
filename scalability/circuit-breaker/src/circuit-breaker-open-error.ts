export class CircuitBreakerOpenError extends Error {
  constructor() {
    super("Circuit is OPEN");
  }
}
