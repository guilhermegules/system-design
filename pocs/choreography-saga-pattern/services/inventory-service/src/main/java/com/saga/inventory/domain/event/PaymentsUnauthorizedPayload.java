package com.saga.inventory.domain.event;

import java.util.UUID;

public record PaymentsUnauthorizedPayload(UUID orderId, UUID paymentId, String reason) {}
