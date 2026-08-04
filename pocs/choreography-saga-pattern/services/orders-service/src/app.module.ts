import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from '@config/configuration';
import { OrdersModule } from '@application/orders.module';
import { CacheModule } from '@infrastructure/cache/cache.module';
import { HttpModule } from '@infrastructure/http/http.module';
import { KafkaModule } from '@infrastructure/messaging/kafka/kafka.module';
import { MessagingModule } from '@infrastructure/messaging/messaging.module';
import { ObservabilityModule } from '@infrastructure/observability/observability.module';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';

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
    PersistenceModule,
    ObservabilityModule,
    OrdersModule,
    MessagingModule,
    HttpModule,
  ],
})
export class AppModule {}
