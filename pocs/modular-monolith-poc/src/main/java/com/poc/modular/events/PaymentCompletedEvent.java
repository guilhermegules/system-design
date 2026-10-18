package com.poc.modular.events;

public record PaymentCompletedEvent(Long orderId, String paymentReference) {
}
