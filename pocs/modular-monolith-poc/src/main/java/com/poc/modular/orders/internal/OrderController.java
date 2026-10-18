package com.poc.modular.orders.internal;

import com.poc.modular.orders.OrderApi;
import com.poc.modular.orders.OrderView;
import com.poc.modular.orders.PlaceOrderCommand;
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

  private final OrderApi orderApi;

  public OrderController(OrderApi orderApi) {
    this.orderApi = orderApi;
  }

  @PostMapping
  public ResponseEntity<OrderView> place(@Valid @RequestBody PlaceOrderCommand command) {
    OrderView view = orderApi.place(command);
    return ResponseEntity.created(URI.create("/api/orders/" + view.id())).body(view);
  }

  @GetMapping
  public List<OrderView> list() {
    return orderApi.findAll();
  }

  @GetMapping("/{id}")
  public OrderView get(@PathVariable Long id) {
    return orderApi.getRequired(id);
  }
}