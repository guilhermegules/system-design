import configuration from '@config/configuration';

const KEYS = [
  'PORT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'REDIS_HOST',
  'REDIS_PORT',
  'KAFKA_BROKERS',
];

describe('configuration', () => {
  let original: NodeJS.ProcessEnv;

  beforeEach(() => {
    original = { ...process.env };
    KEYS.forEach((key) => delete process.env[key]);
  });

  afterEach(() => {
    process.env = original;
  });

  it('applies defaults when no environment variables are set', () => {
    expect(configuration()).toEqual({
      port: 3000,
      db: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        name: 'orders',
      },
      redis: {
        host: 'localhost',
        port: 6379,
      },
      kafka: {
        brokers: ['localhost:9092'],
      },
    });
  });

  it('reads overrides from the environment', () => {
    process.env.PORT = '4000';
    process.env.POSTGRES_HOST = 'db.example.com';
    process.env.POSTGRES_PORT = '5433';
    process.env.POSTGRES_USER = 'orders_user';
    process.env.POSTGRES_PASSWORD = 'secret';
    process.env.POSTGRES_DB = 'orders_prod';
    process.env.REDIS_HOST = 'redis.example.com';
    process.env.REDIS_PORT = '6380';
    process.env.KAFKA_BROKERS = 'broker-1:9092,broker-2:9092';

    const cfg = configuration();

    expect(cfg.port).toBe(4000);
    expect(cfg.db).toEqual({
      host: 'db.example.com',
      port: 5433,
      username: 'orders_user',
      password: 'secret',
      name: 'orders_prod',
    });
    expect(cfg.redis).toEqual({ host: 'redis.example.com', port: 6380 });
    expect(cfg.kafka.brokers).toEqual(['broker-1:9092', 'broker-2:9092']);
  });
});
