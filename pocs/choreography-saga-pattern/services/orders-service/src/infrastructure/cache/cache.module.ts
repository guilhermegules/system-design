import { OrderCache } from '@domain/ports/order-cache';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.tokens';
import { RedisService } from './redis.service';
import { RedisCacheAdapter } from './redis-cache.adapter';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
          lazyConnect: true,
          maxRetriesPerRequest: 3,
        }),
      inject: [ConfigService],
    },
    RedisService,
    { provide: OrderCache, useClass: RedisCacheAdapter },
  ],
  exports: [RedisService, OrderCache],
})
export class CacheModule {}
