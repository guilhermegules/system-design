package com.saga.inventory.service;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.saga.inventory.domain.OutboxEvent;
import com.saga.inventory.repository.OutboxEventRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);

    private final OutboxEventRepository repo;
    private final KafkaTemplate<String, String> kafka;
    private final ObjectMapper mapper;

    public OutboxService(OutboxEventRepository repo, KafkaTemplate<String, String> kafka, ObjectMapper mapper) {
        this.repo = repo;
        this.kafka = kafka;
        this.mapper = mapper;
    }

    @Transactional
    public void enqueue(String eventType, UUID correlationId, Map<String, Object> payload) {
        OutboxEvent event = new OutboxEvent();
        event.setEventId(UUID.randomUUID());
        event.setEventType(eventType);
        event.setCorrelationId(correlationId);
        event.setPayload(write(payload));
        event.setStatus("PENDING");
        event.setCreatedAt(Instant.now());
        repo.save(event);
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:2000}")
    public void poll() {
        Page<OutboxEvent> pending = repo.findByStatusOrderByCreatedAtAsc("PENDING", PageRequest.of(0, 50));
        for (OutboxEvent event : pending) {
            try {
                Map<String, Object> envelope = new HashMap<>();
                envelope.put("eventId", event.getEventId().toString());
                envelope.put("correlationId", event.getCorrelationId().toString());
                envelope.put("eventType", event.getEventType());
                envelope.put("occurredAt", event.getCreatedAt().toString());
                envelope.put("payload", read(event.getPayload()));

                kafka.send(event.getEventType(), event.getCorrelationId().toString(), write(envelope))
                        .get(10, TimeUnit.SECONDS);

                event.setStatus("SENT");
                event.setSentAt(Instant.now());
                repo.save(event);
            } catch (Exception ex) {
                log.error("failed to publish outbox event {} ({})", event.getEventId(), event.getEventType(), ex);
            }
        }
    }

    private String write(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JacksonException ex) {
            throw new IllegalStateException("failed to serialize JSON", ex);
        }
    }

    private Map<String, Object> read(String json) {
        try {
            return mapper.readValue(json, new TypeReference<>() {
            });
        } catch (JacksonException ex) {
            throw new IllegalStateException("failed to parse JSON", ex);
        }
    }
}
