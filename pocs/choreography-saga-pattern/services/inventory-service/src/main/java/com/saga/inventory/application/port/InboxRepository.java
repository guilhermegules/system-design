package com.saga.inventory.application.port;

import com.saga.inventory.domain.event.EventEnvelope;
import java.util.UUID;

public interface InboxRepository {

  boolean exists(UUID eventId);

  void markProcessed(EventEnvelope envelope);
}
