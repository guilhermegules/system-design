import { Module } from '@nestjs/common';
import { CacheModule } from '@infrastructure/cache/cache.module';
import { ObservabilityModule } from '@infrastructure/observability/observability.module';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { OrderEventsService } from './order-events.service';
import { OrderService } from './order.service';

@Module({
  imports: [PersistenceModule, CacheModule, ObservabilityModule],
  providers: [OrderService, OrderEventsService],
  exports: [OrderService, OrderEventsService],
})
export class OrdersModule {}
