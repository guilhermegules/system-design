export abstract class OrderCache {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  abstract del(...keys: string[]): Promise<void>;
}
