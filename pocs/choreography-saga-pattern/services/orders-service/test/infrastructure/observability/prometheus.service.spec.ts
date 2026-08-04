import { PrometheusService } from '@infrastructure/observability/prometheus.service';

describe('PrometheusService', () => {
  let service: PrometheusService;

  beforeEach(() => {
    service = new PrometheusService();
  });

  it('collects default metrics on init', () => {
    expect(() => service.onModuleInit()).not.toThrow();
  });

  it('increments counters and renders the metrics payload', async () => {
    service.incOrdersCreated();
    service.incOrdersCompleted();
    service.incOrdersCancelled();

    const out = await service.metrics();

    expect(out).toContain('orders_created_total');
    expect(out).toContain('orders_completed_total');
    expect(out).toContain('orders_cancelled_total');
  });
});
