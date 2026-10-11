package com.poc.modular.payment;

import com.poc.modular.shared.Money;
import java.time.Instant;

public record PaymentView(Long id, Long orderId, String reference, String status, Money amount,
    Instant createdAt) {
}
