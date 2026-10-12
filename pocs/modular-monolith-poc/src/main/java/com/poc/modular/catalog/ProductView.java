package com.poc.modular.catalog;

import com.poc.modular.shared.Money;

public record ProductView(Long id, String sku, String name, Money price) {
}