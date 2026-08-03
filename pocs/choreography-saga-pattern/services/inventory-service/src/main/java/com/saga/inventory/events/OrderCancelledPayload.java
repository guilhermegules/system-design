package com.saga.inventory.events;

import java.util.UUID;

public record OrderCancelledPayload(UUID orderId, String reason) {
}
