export interface Metrics {
  incOrdersCreated(): void;
  incOrdersCompleted(): void;
  incOrdersCancelled(): void;
}

export const Metrics = 'Metrics';
