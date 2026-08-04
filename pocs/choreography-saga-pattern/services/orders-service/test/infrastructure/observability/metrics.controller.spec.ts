import { MetricsController } from '@infrastructure/observability/metrics.controller';

describe('MetricsController', () => {
  it('returns the prometheus metrics payload', async () => {
    const prometheus = { metrics: jest.fn().mockResolvedValue('# TYPE orders_created_total counter') };
    const controller = new MetricsController(prometheus as never);

    await expect(controller.metrics()).resolves.toBe(
      '# TYPE orders_created_total counter',
    );
    expect(prometheus.metrics).toHaveBeenCalledTimes(1);
  });
});
