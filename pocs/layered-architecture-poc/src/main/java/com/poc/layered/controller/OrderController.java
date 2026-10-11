package com.poc.layered.controller;

import com.poc.layered.dto.CreateOrderRequest;
import com.poc.layered.dto.OrderResponse;
import com.poc.layered.service.OrderService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping
  public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
    OrderResponse response = orderService.create(request);
    return ResponseEntity.created(URI.create("/api/orders/" + response.id())).body(response);
  }

  @GetMapping
  public List<OrderResponse> list() {
    return orderService.list();
  }

  @GetMapping("/{id}")
  public OrderResponse get(@PathVariable Long id) {
    return orderService.get(id);
  }
}
