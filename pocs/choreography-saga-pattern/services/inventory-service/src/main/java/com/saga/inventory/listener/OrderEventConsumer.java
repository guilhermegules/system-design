package com.saga.inventory.listener;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.saga.inventory.events.EventEnvelope;
import com.saga.inventory.service.InboxService;
import com.saga.inventory.service.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

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
        inbox.process(envelope, () -> inventory.handleOrderCreated(envelope));
    }

    @KafkaListener(topics = "order.cancelled", groupId = "inventory-service")
    public void onOrderCancelled(String message) {
        EventEnvelope envelope = parse(message);
        inbox.process(envelope, () -> inventory.handleOrderCancelled(envelope));
    }

    private EventEnvelope parse(String message) {
        try {
            return mapper.readValue(message, EventEnvelope.class);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("malformed event", ex);
        }
    }
}
