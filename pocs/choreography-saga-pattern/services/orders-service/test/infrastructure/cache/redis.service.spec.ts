import { RedisService } from '@infrastructure/cache/redis.service';
import { Logger } from '@nestjs/common';

describe('RedisService', () => {
  let client: {
    status: string;
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    connect: jest.Mock;
    quit: jest.Mock;
  };
  let service: RedisService;

  beforeEach(() => {
    client = {
      status: 'ready',
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      connect: jest.fn(),
      quit: jest.fn(),
    };
    service = new RedisService(client as unknown as never);
  });

  describe('onModuleInit', () => {
    it('connects when the client is waiting', async () => {
      client.status = 'wait';
      await service.onModuleInit();
      expect(client.connect).toHaveBeenCalledTimes(1);
    });

    it('skips connecting when the client is already connected', async () => {
      await service.onModuleInit();
      expect(client.connect).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('quits the client', async () => {
      await service.onModuleDestroy();
      expect(client.quit).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    it('parses a cached value', async () => {
      client.get.mockResolvedValue('{"a":1}');
      await expect(service.get<{ a: number }>('key')).resolves.toEqual({ a: 1 });
      expect(client.get).toHaveBeenCalledWith('key');
    });

    it('returns null on a cache miss', async () => {
      client.get.mockResolvedValue(null);
      await expect(service.get('key')).resolves.toBeNull();
    });

    it('returns null when the client throws', async () => {
      client.get.mockRejectedValue(new Error('redis down'));
      await expect(service.get('key')).resolves.toBeNull();
    });
  });

  describe('set', () => {
    it('stores a JSON value with the default TTL', async () => {
      await service.set('key', { a: 1 });
      expect(client.set).toHaveBeenCalledWith('key', '{"a":1}', 'EX', 60);
    });

    it('stores a value with a custom TTL', async () => {
      await service.set('key', 1, 120);
      expect(client.set).toHaveBeenCalledWith('key', '1', 'EX', 120);
    });

    it('logs a warning when the client throws', async () => {
      client.set.mockRejectedValue(new Error('redis down'));
      const logger = (service as unknown as { logger: Logger }).logger;
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await expect(service.set('key', 1)).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('del', () => {
    it('deletes the given keys', async () => {
      await service.del('a', 'b');
      expect(client.del).toHaveBeenCalledWith('a', 'b');
    });

    it('does nothing when no keys are given', async () => {
      await service.del();
      expect(client.del).not.toHaveBeenCalled();
    });

    it('logs a warning when the client throws', async () => {
      client.del.mockRejectedValue(new Error('redis down'));
      const logger = (service as unknown as { logger: Logger }).logger;
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await expect(service.del('a')).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
