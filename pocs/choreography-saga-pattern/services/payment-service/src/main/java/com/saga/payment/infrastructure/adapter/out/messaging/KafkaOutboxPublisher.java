package com.saga.payment.infrastructure.adapter.out.messaging;

import com.saga.payment.application.port.EventPublisher;
import com.saga.payment.domain.event.EventEnvelope;
import java.util.concurrent.TimeUnit;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class KafkaOutboxPublisher implements EventPublisher {

    private final KafkaTemplate<String, String> kafka;
    private final ObjectMapper mapper;

    public KafkaOutboxPublisher(KafkaTemplate<String, String> kafka, ObjectMapper mapper) {
        this.kafka = kafka;
        this.mapper = mapper;
    }

    @Override
    public void publish(EventEnvelope envelope) {
        try {
            kafka.send(envelope.eventType(), envelope.correlationId().toString(), write(envelope))
                    .get(10, TimeUnit.SECONDS);
        } catch (Exception ex) {
            throw new IllegalStateException(
                    "failed to publish event " + envelope.eventType() + " (" + envelope.eventId() + ")", ex);
        }
    }

    private String write(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JacksonException ex) {
            throw new IllegalStateException("failed to serialize JSON", ex);
        }
    }
}
