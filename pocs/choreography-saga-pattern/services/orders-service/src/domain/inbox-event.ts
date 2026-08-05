export class InboxEvent {
  constructor(
    public readonly eventId: string,
    public readonly eventType: string,
    public readonly correlationId: string,
    public readonly payload: Record<string, unknown>,
    public readonly processedAt: Date,
  ) {}
}
