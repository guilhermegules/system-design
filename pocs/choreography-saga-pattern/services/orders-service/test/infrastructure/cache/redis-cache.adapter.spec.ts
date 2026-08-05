import { RedisService } from '@infrastructure/cache/redis.service';
import { RedisCacheAdapter } from '@infrastructure/cache/redis-cache.adapter';

describe('RedisCacheAdapter', () => {
  let redis: jest.Mocked<Pick<RedisService, 'get' | 'set' | 'del'>>;
  let adapter: RedisCacheAdapter;

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    adapter = new RedisCacheAdapter(redis as unknown as RedisService);
  });

  it('delegates get', async () => {
    redis.get.mockResolvedValue({ a: 1 });
    await expect(adapter.get<{ a: number }>('key')).resolves.toEqual({ a: 1 });
    expect(redis.get).toHaveBeenCalledWith('key');
  });

  it('delegates set', async () => {
    await adapter.set('key', { a: 1 }, 30);
    expect(redis.set).toHaveBeenCalledWith('key', { a: 1 }, 30);
  });

  it('delegates del', async () => {
    await adapter.del('a', 'b');
    expect(redis.del).toHaveBeenCalledWith('a', 'b');
  });
});
