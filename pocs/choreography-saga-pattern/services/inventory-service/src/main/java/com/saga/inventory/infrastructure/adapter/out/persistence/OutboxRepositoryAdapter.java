package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.application.port.OutboxRepository;
import com.saga.inventory.domain.OutboxEvent;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class OutboxRepositoryAdapter implements OutboxRepository {

    private final JpaOutboxEventRepository jpa;
    private final ObjectMapper mapper;

    public OutboxRepositoryAdapter(JpaOutboxEventRepository jpa, ObjectMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public void enqueue(String eventType, UUID correlationId, Map<String, Object> payload) {
        OutboxEvent event = new OutboxEvent();
        event.setId(UUID.randomUUID());
        event.setEventId(UUID.randomUUID());
        event.setEventType(eventType);
        event.setCorrelationId(correlationId);
        event.setPayload(write(payload));
        event.setStatus("PENDING");
        event.setCreatedAt(Instant.now());
        jpa.save(OutboxEventEntity.fromDomain(event));
    }

    @Override
    public List<OutboxEvent> fetchPending(int limit) {
        return jpa.findByStatusOrderByCreatedAtAsc("PENDING", PageRequest.of(0, limit))
                .getContent().stream()
                .map(OutboxEventEntity::toDomain)
                .toList();
    }

    @Override
    public void markSent(UUID id, Instant sentAt) {
        jpa.findById(id).ifPresent(entity -> {
            entity.setStatus("SENT");
            entity.setSentAt(sentAt);
            jpa.save(entity);
        });
    }

    private String write(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JacksonException ex) {
            throw new IllegalStateException("failed to serialize JSON", ex);
        }
    }
}
