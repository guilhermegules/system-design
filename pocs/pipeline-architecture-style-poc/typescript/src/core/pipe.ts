import { IPipe } from './types.js';

export class AsyncQueuePipe<T> implements IPipe<T> {
  private queue: T[] = [];
  private waiters: ((value: T | null) => void)[] = [];
  private closed = false;
  private readonly maxCapacity: number;

  constructor(maxCapacity = 100) {
    this.maxCapacity = maxCapacity;
  }

  async send(payload: T): Promise<void> {
    if (this.closed) throw new Error('Cannot send to a closed Pipe');

    if (this.waiters.length > 0) {
      const resolveWaiter = this.waiters.shift()!;
      resolveWaiter(payload);
      return;
    }

    if (this.queue.length >= this.maxCapacity) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.queue.push(payload);
  }

  async receive(): Promise<T | null> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }
    if (this.closed) {
      return null;
    }
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  close(): void {
    this.closed = true;
    while (this.waiters.length > 0) {
      const resolveWaiter = this.waiters.shift()!;
      resolveWaiter(null);
    }
  }

  isClosed(): boolean {
    return this.closed && this.queue.length === 0;
  }
}

export class DistributedMessagePipe<T> implements IPipe<T> {
  private queue: string[] = [];
  private closed = false;
  private readonly simulatedLatencyMs: number;

  constructor(public readonly topicName: string, simulatedLatencyMs = 15) {
    this.simulatedLatencyMs = simulatedLatencyMs;
  }

  async send(payload: T): Promise<void> {
    if (this.closed) throw new Error(`[Broker ${this.topicName}] Cannot send to closed topic`);
    await new Promise((res) => setTimeout(res, this.simulatedLatencyMs));
    const serialized = JSON.stringify(payload);
    this.queue.push(serialized);
  }

  async receive(): Promise<T | null> {
    while (this.queue.length === 0) {
      if (this.closed) return null;
      await new Promise((res) => setTimeout(res, 10));
    }
    await new Promise((res) => setTimeout(res, this.simulatedLatencyMs));
    const raw = this.queue.shift()!;
    return JSON.parse(raw) as T;
  }

  close(): void {
    this.closed = true;
  }

  isClosed(): boolean {
    return this.closed && this.queue.length === 0;
  }
}
