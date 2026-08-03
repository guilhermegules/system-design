package com.saga.inventory.events;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderCreatedPayload(
        UUID orderId,
        UUID customerId,
        List<Item> items,
        BigDecimal totalAmount,
        String currency,
        String simulate) {

    public record Item(String productId, int quantity, BigDecimal unitPrice) {
    }
}
