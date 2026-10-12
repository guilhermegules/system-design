package com.poc.modular.orders;

import com.poc.modular.shared.Money;

public record OrderLineView(Long productId, String sku, int quantity, Money unitPrice,
    Money lineTotal) {
}