package com.saga.inventory.events;

import java.util.UUID;

public record PaymentsUnauthorizedPayload(UUID orderId, UUID paymentId, String reason) {
}
