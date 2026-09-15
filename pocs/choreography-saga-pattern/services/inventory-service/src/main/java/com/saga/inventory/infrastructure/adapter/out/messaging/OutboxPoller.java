package com.saga.inventory.infrastructure.adapter.out.messaging;

import com.saga.inventory.application.port.EventPublisher;
import com.saga.inventory.application.port.OutboxRepository;
import com.saga.inventory.domain.OutboxEvent;
import com.saga.inventory.domain.event.EventEnvelope;
import java.time.Instant;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Component
public class OutboxPoller {

  private static final Logger log = LoggerFactory.getLogger(OutboxPoller.class);

  private final OutboxRepository outbox;
  private final EventPublisher publisher;
  private final ObjectMapper mapper;

  public OutboxPoller(OutboxRepository outbox, EventPublisher publisher, ObjectMapper mapper) {
    this.outbox = outbox;
    this.publisher = publisher;
    this.mapper = mapper;
  }

  @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:2000}")
  public void poll() {
    for (OutboxEvent event : outbox.fetchPending(50)) {
      try {
        EventEnvelope envelope =
            new EventEnvelope(
                event.getEventId(),
                event.getCorrelationId(),
                event.getEventType(),
                event.getCreatedAt(),
                readMap(event.getPayload()));

        publisher.publish(envelope);
        outbox.markSent(event.getId(), Instant.now());
      } catch (Exception ex) {
        log.error(
            "failed to publish outbox event {} ({})", event.getEventId(), event.getEventType(), ex);
      }
    }
  }

  private Map<String, Object> readMap(String json) {
    try {
      return mapper.readValue(json, new TypeReference<>() {});
    } catch (JacksonException ex) {
      throw new IllegalStateException("failed to parse JSON", ex);
    }
  }
}
