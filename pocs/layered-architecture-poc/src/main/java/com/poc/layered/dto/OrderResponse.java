package com.poc.layered.dto;

import com.poc.layered.entity.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, String reference, String customerName, String status,
    BigDecimal total, Instant createdAt, List<OrderItemResponse> items) {

  public static OrderResponse from(Order order) {
    List<OrderItemResponse> itemResponses = order.getItems().stream()
        .map(OrderItemResponse::from)
        .toList();
    return new OrderResponse(order.getId(), order.getReference(), order.getCustomerName(),
        order.getStatus(), order.getTotal(), order.getCreatedAt(), itemResponses);
  }
}
