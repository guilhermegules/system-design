import { Metrics } from '@domain/ports/metrics';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, collectDefaultMetrics, Registry } from 'prom-client';

@Injectable()
export class PrometheusService implements Metrics, OnModuleInit {
  readonly registry = new Registry();

  private readonly ordersCreated = new Counter({
    name: 'orders_created_total',
    help: 'Total number of orders created',
    registers: [this.registry],
  });

  private readonly ordersCompleted = new Counter({
    name: 'orders_completed_total',
    help: 'Total number of orders completed',
    registers: [this.registry],
  });

  private readonly ordersCancelled = new Counter({
    name: 'orders_cancelled_total',
    help: 'Total number of orders cancelled',
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.registry });
  }

  incOrdersCreated(): void {
    this.ordersCreated.inc();
  }

  incOrdersCompleted(): void {
    this.ordersCompleted.inc();
  }

  incOrdersCancelled(): void {
    this.ordersCancelled.inc();
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
