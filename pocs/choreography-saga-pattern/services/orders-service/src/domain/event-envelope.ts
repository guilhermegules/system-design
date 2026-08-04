export interface EventEnvelope<T = unknown> {
  eventId: string;
  correlationId: string;
  eventType: string;
  occurredAt: string;
  payload: T;
}

export function buildEnvelope<T>(event: {
  eventId: string;
  correlationId: string;
  eventType: string;
  occurredAt: Date;
  payload: T;
}): EventEnvelope<T> {
  return {
    eventId: event.eventId,
    correlationId: event.correlationId,
    eventType: event.eventType,
    occurredAt: event.occurredAt.toISOString(),
    payload: event.payload,
  };
}
