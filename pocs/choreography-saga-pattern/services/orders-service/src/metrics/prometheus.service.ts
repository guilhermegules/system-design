import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Registry,
} from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  readonly registry = new Registry();

  readonly ordersCreated = new Counter({
    name: 'orders_created_total',
    help: 'Total number of orders created',
    registers: [this.registry],
  });

  readonly ordersCompleted = new Counter({
    name: 'orders_completed_total',
    help: 'Total number of orders completed',
    registers: [this.registry],
  });

  readonly ordersCancelled = new Counter({
    name: 'orders_cancelled_total',
    help: 'Total number of orders cancelled',
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.registry });
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
