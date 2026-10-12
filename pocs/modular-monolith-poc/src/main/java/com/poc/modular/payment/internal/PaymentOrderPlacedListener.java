package com.poc.modular.payment.internal;

import com.poc.modular.events.OrderPlacedEvent;
import com.poc.modular.events.PaymentCompletedEvent;
import com.poc.modular.payment.PaymentView;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentOrderPlacedListener {

  private final PaymentService paymentService;
  private final ApplicationEventPublisher eventPublisher;

  public PaymentOrderPlacedListener(PaymentService paymentService,
      ApplicationEventPublisher eventPublisher) {
    this.paymentService = paymentService;
    this.eventPublisher = eventPublisher;
  }

  @ApplicationModuleListener
  public void onOrderPlaced(OrderPlacedEvent event) {
    PaymentView payment = paymentService.charge(event.orderId(), event.total());
    eventPublisher.publishEvent(new PaymentCompletedEvent(event.orderId(), payment.reference()));
  }
}
