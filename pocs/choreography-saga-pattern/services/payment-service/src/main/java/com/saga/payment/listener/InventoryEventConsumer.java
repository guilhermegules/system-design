package com.saga.payment.listener;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.saga.payment.events.EventEnvelope;
import com.saga.payment.service.InboxService;
import com.saga.payment.service.PaymentService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

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
        inbox.process(envelope, () -> payment.handleInventoryReserved(envelope));
    }

    private EventEnvelope parse(String message) {
        try {
            return mapper.readValue(message, EventEnvelope.class);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("malformed event", ex);
        }
    }
}
