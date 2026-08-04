import { HealthController } from '@infrastructure/http/health.controller';

describe('HealthController', () => {
  it('reports the service as ok', () => {
    const controller = new HealthController();
    expect(controller.check()).toEqual({ status: 'ok', service: 'orders-service' });
  });
});
