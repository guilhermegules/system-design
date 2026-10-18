package com.poc.modular.orders;

import com.poc.modular.shared.Money;
import java.time.Instant;
import java.util.List;

public record OrderView(Long id, String reference, String customerName, String status,
    Money total, Instant createdAt, List<OrderLineView> items) {
}