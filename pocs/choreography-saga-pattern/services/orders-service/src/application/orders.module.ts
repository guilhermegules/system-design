import { CacheModule } from '@infrastructure/cache/cache.module';
import { ObservabilityModule } from '@infrastructure/observability/observability.module';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEventsService } from './order-events.service';

@Module({
  imports: [PersistenceModule, CacheModule, ObservabilityModule],
  providers: [OrderService, OrderEventsService],
  exports: [OrderService, OrderEventsService],
})
export class OrdersModule {}
