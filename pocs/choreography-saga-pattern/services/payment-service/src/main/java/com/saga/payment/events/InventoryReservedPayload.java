package com.saga.payment.events;

import java.math.BigDecimal;
import java.util.UUID;

public record InventoryReservedPayload(
        UUID orderId,
        UUID reservationId,
        BigDecimal totalAmount,
        String currency,
        String simulate) {
}
