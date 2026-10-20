export interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

export class MapReduceEngine<TInput, TKey extends string | number, TIntermediate, TOutput> {
  constructor(
    private readonly mapper: (item: TInput) => Promise<KeyValuePair<TKey, TIntermediate>[]>,
    private readonly reducer: (key: TKey, values: TIntermediate[]) => Promise<TOutput>
  ) {}

  async process(items: TInput[]): Promise<Map<TKey, TOutput>> {
    const mapResults = await Promise.all(items.map((item) => this.mapper(item)));
    const flatPairs = mapResults.flat();

    const groups = new Map<TKey, TIntermediate[]>();
    for (const { key, value } of flatPairs) {
      const existing = groups.get(key) ?? [];
      existing.push(value);
      groups.set(key, existing);
    }

    const reducedResults = new Map<TKey, TOutput>();
    for (const [key, values] of groups.entries()) {
      const reduced = await this.reducer(key, values);
      reducedResults.set(key, reduced);
    }

    return reducedResults;
  }
}
