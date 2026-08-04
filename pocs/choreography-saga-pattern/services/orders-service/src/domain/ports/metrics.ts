export abstract class Metrics {
  abstract incOrdersCreated(): void;
  abstract incOrdersCompleted(): void;
  abstract incOrdersCancelled(): void;
}
