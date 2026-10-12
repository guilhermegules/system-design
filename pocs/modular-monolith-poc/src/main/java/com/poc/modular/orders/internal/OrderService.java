package com.poc.modular.orders.internal;

import com.poc.modular.catalog.ProductApi;
import com.poc.modular.catalog.ProductView;
import com.poc.modular.events.OrderPlacedEvent;
import com.poc.modular.orders.OrderApi;
import com.poc.modular.orders.OrderLineView;
import com.poc.modular.orders.OrderView;
import com.poc.modular.orders.PlaceOrderCommand;
import com.poc.modular.orders.PlaceOrderCommand.Line;
import com.poc.modular.shared.Money;
import com.poc.modular.shared.NotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService implements OrderApi {

  private static final String CURRENCY = "USD";

  private final OrderRepository orderRepository;
  private final ProductApi productApi;
  private final ApplicationEventPublisher eventPublisher;

  public OrderService(OrderRepository orderRepository, ProductApi productApi,
      ApplicationEventPublisher eventPublisher) {
    this.orderRepository = orderRepository;
    this.productApi = productApi;
    this.eventPublisher = eventPublisher;
  }

  @Override
  @Transactional
  public OrderView place(PlaceOrderCommand command) {
    Order order = new Order(generateReference(), command.customerName(), "PLACED");
    List<OrderPlacedEvent.Line> reservation = new ArrayList<>();
    for (Line line : command.items()) {
      ProductView product = productApi.getRequired(line.productId());
      order.addItem(new OrderItem(product.id(), product.sku(), line.quantity(),
          product.price().amount()));
      reservation.add(new OrderPlacedEvent.Line(product.id(), line.quantity()));
    }
    Order saved = orderRepository.save(order);
    eventPublisher.publishEvent(new OrderPlacedEvent(saved.getId(),
        Money.of(saved.getTotal(), CURRENCY), reservation));
    return toView(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public OrderView getRequired(Long orderId) {
    return toView(orderRepository.findById(orderId)
        .orElseThrow(() -> new NotFoundException("Order " + orderId + " not found")));
  }

  @Override
  @Transactional(readOnly = true)
  public List<OrderView> findAll() {
    return orderRepository.findAll().stream().map(this::toView).toList();
  }

  private OrderView toView(Order order) {
    List<OrderLineView> itemViews = order.getItems().stream()
        .map(item -> new OrderLineView(item.getProductId(), item.getSku(), item.getQuantity(),
            Money.of(item.getUnitPrice(), CURRENCY), Money.of(item.lineTotal(), CURRENCY)))
        .toList();
    return new OrderView(order.getId(), order.getReference(), order.getCustomerName(),
        order.getStatus(), Money.of(order.getTotal(), CURRENCY), order.getCreatedAt(), itemViews);
  }

  private String generateReference() {
    return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
  }
}