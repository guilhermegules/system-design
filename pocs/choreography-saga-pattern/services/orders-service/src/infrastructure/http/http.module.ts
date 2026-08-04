import { Module } from '@nestjs/common';
import { OrdersModule } from '@application/orders.module';
import { HealthController } from './health.controller';
import { OrdersController } from './orders.controller';

@Module({
  imports: [OrdersModule],
  controllers: [OrdersController, HealthController],
})
export class HttpModule {}
