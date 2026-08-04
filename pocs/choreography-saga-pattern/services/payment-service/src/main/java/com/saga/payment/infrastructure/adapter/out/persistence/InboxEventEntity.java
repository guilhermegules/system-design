package com.saga.payment.infrastructure.adapter.out.persistence;

import com.saga.payment.domain.InboxEvent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inbox_events")
public class InboxEventEntity {

    @Id
    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "correlation_id", nullable = false)
    private UUID correlationId;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    public InboxEventEntity() {
    }

    public static InboxEventEntity fromDomain(InboxEvent event) {
        InboxEventEntity entity = new InboxEventEntity();
        entity.eventId = event.getEventId();
        entity.eventType = event.getEventType();
        entity.correlationId = event.getCorrelationId();
        entity.processedAt = event.getProcessedAt();
        return entity;
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
