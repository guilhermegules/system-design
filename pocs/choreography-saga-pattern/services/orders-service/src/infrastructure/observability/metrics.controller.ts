import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';

@Controller()
export class MetricsController {
  constructor(private readonly prometheus: PrometheusService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metrics(): Promise<string> {
    return this.prometheus.metrics();
  }
}
