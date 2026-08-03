import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { CacheModule } from './cache/cache.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { InboxModule } from './inbox/inbox.module';
import { KafkaModule } from './kafka/kafka.module';
import { OrdersModule } from './orders/orders.module';
import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('db.host'),
        port: config.getOrThrow<number>('db.port'),
        username: config.getOrThrow<string>('db.username'),
        password: config.getOrThrow<string>('db.password'),
        database: config.getOrThrow<string>('db.name'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    KafkaModule,
    CacheModule,
    EventsModule,
    OrdersModule,
    OutboxModule,
    InboxModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
