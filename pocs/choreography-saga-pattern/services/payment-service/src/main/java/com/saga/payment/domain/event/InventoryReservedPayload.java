package com.saga.payment.domain.event;

import java.math.BigDecimal;
import java.util.UUID;

public record InventoryReservedPayload(
    UUID orderId, UUID reservationId, BigDecimal totalAmount, String currency, String simulate) {}
