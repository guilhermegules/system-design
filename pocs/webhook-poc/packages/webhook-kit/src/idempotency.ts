export interface ProcessedEventRecord {
  eventId: string;
  eventType: string;
  processedAt: string;
}

/**
 * Ensures idempotent webhook processing (Inbox pattern).
 * Because webhook providers use at-least-once delivery and retry on network timeouts,
 * consumers may receive the exact same event ID multiple times.
 */
export class IdempotencyStore {
  private readonly processedEvents = new Map<string, ProcessedEventRecord>();

  public hasProcessed(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  public markProcessed(eventId: string, eventType: string): void {
    this.processedEvents.set(eventId, {
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
    });
  }

  public getRecord(eventId: string): ProcessedEventRecord | undefined {
    return this.processedEvents.get(eventId);
  }

  public getAll(): ProcessedEventRecord[] {
    return Array.from(this.processedEvents.values());
  }

  public clear(): void {
    this.processedEvents.clear();
  }
}
