package com.saga.inventory.infrastructure.adapter.in.kafka;

import com.saga.inventory.application.InboxService;
import com.saga.inventory.application.InventoryService;
import com.saga.inventory.domain.event.EventEnvelope;
import com.saga.inventory.domain.event.OrderCreatedPayload;
import com.saga.inventory.domain.event.PaymentsUnauthorizedPayload;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class OrderEventConsumer {

    private final ObjectMapper mapper;
    private final InboxService inbox;
    private final InventoryService inventory;

    public OrderEventConsumer(ObjectMapper mapper, InboxService inbox, InventoryService inventory) {
        this.mapper = mapper;
        this.inbox = inbox;
        this.inventory = inventory;
    }

    @KafkaListener(topics = "order.created", groupId = "inventory-service")
    public void onOrderCreated(String message) {
        EventEnvelope envelope = parse(message);
        OrderCreatedPayload payload = mapper.convertValue(envelope.payload(), OrderCreatedPayload.class);
        inbox.process(envelope, () -> inventory.handleOrderCreated(payload));
    }

    @KafkaListener(topics = "payments.unauthorized", groupId = "inventory-service")
    public void onPaymentsUnauthorized(String message) {
        EventEnvelope envelope = parse(message);
        PaymentsUnauthorizedPayload payload = mapper.convertValue(envelope.payload(), PaymentsUnauthorizedPayload.class);
        inbox.process(envelope, () -> inventory.handlePaymentUnauthorized(payload));
    }

    private EventEnvelope parse(String message) {
        try {
            return mapper.readValue(message, EventEnvelope.class);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("malformed event", ex);
        }
    }
}
