package com.poc.layered.service;

import com.poc.layered.dto.CreateOrderRequest;
import com.poc.layered.dto.OrderItemRequest;
import com.poc.layered.dto.OrderResponse;
import com.poc.layered.entity.Order;
import com.poc.layered.entity.OrderItem;
import com.poc.layered.entity.Product;
import com.poc.layered.exception.NotFoundException;
import com.poc.layered.repository.OrderRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private final OrderRepository orderRepository;
  private final ProductService productService;

  public OrderService(OrderRepository orderRepository, ProductService productService) {
    this.orderRepository = orderRepository;
    this.productService = productService;
  }

  @Transactional
  public OrderResponse create(CreateOrderRequest request) {
    Order order = new Order(generateReference(), request.customerName(), "PLACED");
    for (OrderItemRequest itemRequest : request.items()) {
      Product product = productService.require(itemRequest.productId());
      product.decrementStock(itemRequest.quantity());
      OrderItem item = new OrderItem(product.getId(), product.getSku(), itemRequest.quantity(),
          product.getPrice());
      order.addItem(item);
    }
    return OrderResponse.from(orderRepository.save(order));
  }

  @Transactional(readOnly = true)
  public OrderResponse get(Long id) {
    return OrderResponse.from(require(id));
  }

  @Transactional(readOnly = true)
  public List<OrderResponse> list() {
    return orderRepository.findAll().stream().map(OrderResponse::from).toList();
  }

  private Order require(Long id) {
    return orderRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Order " + id + " not found"));
  }

  private String generateReference() {
    return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
  }
}
