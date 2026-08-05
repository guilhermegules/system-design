package com.saga.payment.application.port;

import com.saga.payment.domain.event.EventEnvelope;
import java.util.UUID;

public interface InboxRepository {

  boolean exists(UUID eventId);

  void markProcessed(EventEnvelope envelope);
}
