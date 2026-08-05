package com.saga.payment.infrastructure.adapter.out.persistence;

import com.saga.payment.application.port.InboxRepository;
import com.saga.payment.domain.InboxEvent;
import com.saga.payment.domain.event.EventEnvelope;
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
