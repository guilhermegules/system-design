jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));
jest.mock('@nestjs/platform-fastify', () => ({
  FastifyAdapter: jest.fn(),
}));
jest.mock('@nestjs/microservices', () => ({
  Transport: { KAFKA: 'kafka' },
}));
jest.mock('@nestjs/common', () => ({
  ValidationPipe: jest.fn(),
}));
jest.mock('../src/app.module', () => ({
  AppModule: class AppModule {},
}));
jest.mock('../src/otel', () => ({}));

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('main bootstrap', () => {
  it('bootstraps the HTTP and Kafka microservices', async () => {
    const mockApp = {
      useGlobalPipes: jest.fn(),
      connectMicroservice: jest.fn(),
      startAllMicroservices: jest.fn().mockResolvedValue(undefined),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    delete process.env.PORT;
    delete process.env.KAFKA_BROKERS;
    require('../src/main');

    await new Promise((resolve) => setImmediate(resolve));

    expect(FastifyAdapter).toHaveBeenCalledWith({ logger: false });
    expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(mockApp.connectMicroservice).toHaveBeenCalledWith({
      transport: 'kafka',
      options: {
        client: { clientId: 'orders-service', brokers: ['localhost:9092'] },
        consumer: { groupId: 'orders-service' },
      },
    });
    expect(mockApp.startAllMicroservices).toHaveBeenCalledTimes(1);
    expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    expect(logSpy).toHaveBeenCalledWith('orders-service listening on 3000');

    logSpy.mockRestore();
  });
});
