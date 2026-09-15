import { Metrics } from '@domain/ports/metrics';
import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { PrometheusService } from './prometheus.service';

@Module({
  controllers: [MetricsController],
  providers: [PrometheusService, { provide: Metrics, useExisting: PrometheusService }],
  exports: [Metrics, PrometheusService],
})
export class ObservabilityModule {}
