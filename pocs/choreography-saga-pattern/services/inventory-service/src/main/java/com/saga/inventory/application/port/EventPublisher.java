package com.saga.inventory.application.port;

import com.saga.inventory.domain.event.EventEnvelope;

public interface EventPublisher {

  void publish(EventEnvelope envelope);
}
