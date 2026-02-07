import { CircuitBreakerOpenError } from "./circuit-breaker-open-error.js";
import { CircuitBreakerOptions } from "./circuit-breaker-options.js";
import { CircuitState } from "./circuit-state.js";
import { withTimeout } from "./with-timeout.js";

export class CircuitBreaker<TArgs extends any[], TResult> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();

  constructor(
    private readonly action: (...args: TArgs) => Promise<TResult>,
    private readonly options: CircuitBreakerOptions,
  ) {}

  private openCircuit() {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.options.resetTimeout;
    console.log("🔴 Circuit OPEN");
  }

  private closeCircuit() {
    this.failureCount = 0;
    this.successCount = 0;
    this.state = CircuitState.CLOSED;
    console.log("🟢 Circuit CLOSED");
  }

  private halfOpenCircuit() {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    console.log("🟡 Circuit HALF_OPEN");
  }

  private canTry(): boolean {
    if (this.state === CircuitState.OPEN && Date.now() > this.nextAttempt) {
      this.halfOpenCircuit();
      return true;
    }
    return this.state !== CircuitState.OPEN;
  }

  async execute(...args: TArgs): Promise<TResult> {
    if (!this.canTry()) {
      throw new CircuitBreakerOpenError();
    }

    try {
      const result = await withTimeout(
        this.action(...args),
        this.options.executionTimeout,
      );

      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= (this.options.successThreshold ?? 1)) {
        this.closeCircuit();
      }
      return;
    }

    this.failureCount = 0;
  }

  private onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold) {
      this.openCircuit();
    }
  }

  getState() {
    return this.state;
  }
}
