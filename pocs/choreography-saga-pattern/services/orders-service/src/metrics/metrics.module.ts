import { Global, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { PrometheusService } from './prometheus.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class MetricsModule {}
