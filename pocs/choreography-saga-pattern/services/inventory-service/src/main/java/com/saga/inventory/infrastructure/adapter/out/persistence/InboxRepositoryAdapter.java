package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.application.port.InboxRepository;
import com.saga.inventory.domain.InboxEvent;
import com.saga.inventory.domain.event.EventEnvelope;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class InboxRepositoryAdapter implements InboxRepository {

  private final JpaInboxEventRepository jpa;

  public InboxRepositoryAdapter(JpaInboxEventRepository jpa) {
    this.jpa = jpa;
  }

  @Override
  public boolean exists(UUID eventId) {
    return jpa.existsById(eventId);
  }

  @Override
  public void markProcessed(EventEnvelope envelope) {
    jpa.save(
        InboxEventEntity.fromDomain(
            new InboxEvent(envelope.eventId(), envelope.eventType(), envelope.correlationId())));
  }
}
