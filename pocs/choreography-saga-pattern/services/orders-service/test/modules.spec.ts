import { AppModule } from '../src/app.module';
import { OrdersModule } from '../src/application/orders.module';
import { CacheModule } from '../src/infrastructure/cache/cache.module';
import { HttpModule } from '../src/infrastructure/http/http.module';
import { KafkaModule } from '../src/infrastructure/messaging/kafka/kafka.module';
import { MessagingModule } from '../src/infrastructure/messaging/messaging.module';
import { ObservabilityModule } from '../src/infrastructure/observability/observability.module';
import { PersistenceModule } from '../src/infrastructure/persistence/persistence.module';

describe('modules', () => {
  it('defines every application module', () => {
    expect(AppModule).toBeDefined();
    expect(OrdersModule).toBeDefined();
    expect(CacheModule).toBeDefined();
    expect(HttpModule).toBeDefined();
    expect(KafkaModule).toBeDefined();
    expect(MessagingModule).toBeDefined();
    expect(ObservabilityModule).toBeDefined();
    expect(PersistenceModule).toBeDefined();
  });
});
