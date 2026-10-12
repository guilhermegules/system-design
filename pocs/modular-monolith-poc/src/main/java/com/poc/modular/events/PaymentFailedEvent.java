package com.poc.modular.events;

public record PaymentFailedEvent(Long orderId, String reason) {
}
