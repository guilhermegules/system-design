import { CircuitBreaker } from "./circuit-breaker.js";
import { unstableApi } from "./unstable-api.js";

const breaker = new CircuitBreaker(unstableApi, {
  failureThreshold: 3,
  resetTimeout: 5000,
  executionTimeout: 1000,
  successThreshold: 2,
});

async function run() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await breaker.execute();
      console.log("✅", res);
    } catch (err: any) {
      console.log("❌", err.message);
    }

    await new Promise((r) => setTimeout(r, 500));
  }
}

run();
