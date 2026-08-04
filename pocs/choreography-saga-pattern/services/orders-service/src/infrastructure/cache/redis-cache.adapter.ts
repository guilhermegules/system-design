import { OrderCache } from '@domain/ports/order-cache';
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisCacheAdapter implements OrderCache {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.redis.set(key, value, ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    await this.redis.del(...keys);
  }
}
