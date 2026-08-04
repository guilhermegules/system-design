package com.saga.payment.infrastructure.adapter.in.kafka;

import com.saga.payment.application.InboxService;
import com.saga.payment.application.PaymentService;
import com.saga.payment.domain.event.EventEnvelope;
import com.saga.payment.domain.event.InventoryReservedPayload;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class InventoryEventConsumer {

    private final ObjectMapper mapper;
    private final InboxService inbox;
    private final PaymentService payment;

    public InventoryEventConsumer(ObjectMapper mapper, InboxService inbox, PaymentService payment) {
        this.mapper = mapper;
        this.inbox = inbox;
        this.payment = payment;
    }

    @KafkaListener(topics = "inventory.reserved", groupId = "payment-service")
    public void onInventoryReserved(String message) {
        EventEnvelope envelope = parse(message);
        InventoryReservedPayload payload = mapper.convertValue(envelope.payload(), InventoryReservedPayload.class);
        inbox.process(envelope, () -> payment.handleInventoryReserved(payload));
    }

    private EventEnvelope parse(String message) {
        try {
            return mapper.readValue(message, EventEnvelope.class);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("malformed event", ex);
        }
    }
}
