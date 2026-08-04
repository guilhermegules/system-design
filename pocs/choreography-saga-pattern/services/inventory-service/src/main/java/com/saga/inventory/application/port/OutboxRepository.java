package com.saga.inventory.application.port;

import com.saga.inventory.domain.OutboxEvent;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface OutboxRepository {

    void enqueue(String eventType, UUID correlationId, Map<String, Object> payload);

    List<OutboxEvent> fetchPending(int limit);

    void markSent(UUID id, Instant sentAt);
}
