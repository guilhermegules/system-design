package com.saga.payment.domain;

import java.time.Instant;
import java.util.UUID;

public class InboxEvent {

  private UUID eventId;
  private String eventType;
  private UUID correlationId;
  private Instant processedAt;

  public InboxEvent() {}

  public InboxEvent(UUID eventId, String eventType, UUID correlationId) {
    this.eventId = eventId;
    this.eventType = eventType;
    this.correlationId = correlationId;
    this.processedAt = Instant.now();
  }

  public UUID getEventId() {
    return eventId;
  }

  public void setEventId(UUID eventId) {
    this.eventId = eventId;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public UUID getCorrelationId() {
    return correlationId;
  }

  public void setCorrelationId(UUID correlationId) {
    this.correlationId = correlationId;
  }

  public Instant getProcessedAt() {
    return processedAt;
  }

  public void setProcessedAt(Instant processedAt) {
    this.processedAt = processedAt;
  }
}
