export enum FilterType {
  PRODUCER = 'PRODUCER',
  TRANSFORMER = 'TRANSFORMER',
  TESTER = 'TESTER',
  CONSUMER = 'CONSUMER',
}

export interface IFilter<TIn, TOut> {
  readonly name: string;
  readonly type: FilterType;
  execute(input: TIn): Promise<TOut>;
}

export interface IProducerFilter<TOut> extends IFilter<void, AsyncIterable<TOut>> {
  readonly type: FilterType.PRODUCER;
}

export interface ITesterFilter<T> extends IFilter<T, T | null> {
  readonly type: FilterType.TESTER;
  test(input: T): Promise<boolean>;
}

export interface ITransformerFilter<TIn, TOut> extends IFilter<TIn, TOut> {
  readonly type: FilterType.TRANSFORMER;
}

export interface IConsumerFilter<TIn> extends IFilter<TIn, void> {
  readonly type: FilterType.CONSUMER;
}

export interface IPipe<T> {
  send(payload: T): Promise<void>;
  receive(): Promise<T | null>;
  close(): void;
  isClosed(): boolean;
}
