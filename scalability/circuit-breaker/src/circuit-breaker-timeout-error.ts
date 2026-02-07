export class CircuitBreakerTimeoutError extends Error {
  constructor() {
    super("Execution timed out");
  }
}
