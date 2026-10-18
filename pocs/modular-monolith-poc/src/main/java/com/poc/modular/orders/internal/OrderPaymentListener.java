package com.poc.modular.orders.internal;

import com.poc.modular.events.PaymentCompletedEvent;
import com.poc.modular.events.PaymentFailedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class OrderPaymentListener {

  private final OrderRepository orderRepository;

  public OrderPaymentListener(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  @ApplicationModuleListener
  public void onPaymentCompleted(PaymentCompletedEvent event) {
    orderRepository.findById(event.orderId())
        .ifPresent(order -> order.transitionTo("CONFIRMED"));
  }

  @ApplicationModuleListener
  public void onPaymentFailed(PaymentFailedEvent event) {
    orderRepository.findById(event.orderId())
        .ifPresent(order -> order.transitionTo("CANCELLED"));
  }
}
