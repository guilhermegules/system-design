package com.saga.payment.application.port;

import com.saga.payment.domain.event.EventEnvelope;

public interface EventPublisher {

  void publish(EventEnvelope envelope);
}
