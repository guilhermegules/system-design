export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  executionTimeout: number;
  successThreshold?: number;
}
