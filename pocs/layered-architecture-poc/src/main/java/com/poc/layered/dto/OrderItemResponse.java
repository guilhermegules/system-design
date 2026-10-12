package com.poc.layered.dto;

import com.poc.layered.entity.OrderItem;
import java.math.BigDecimal;

public record OrderItemResponse(Long productId, String sku, int quantity, BigDecimal unitPrice,
    BigDecimal lineTotal) {

  public static OrderItemResponse from(OrderItem item) {
    return new OrderItemResponse(item.getProductId(), item.getSku(), item.getQuantity(),
        item.getUnitPrice(), item.lineTotal());
  }
}
