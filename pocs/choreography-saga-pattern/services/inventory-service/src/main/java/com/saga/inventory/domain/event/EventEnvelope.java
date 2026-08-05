package com.saga.inventory.domain.event;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record EventEnvelope(
    UUID eventId,
    UUID correlationId,
    String eventType,
    Instant occurredAt,
    Map<String, Object> payload) {}
