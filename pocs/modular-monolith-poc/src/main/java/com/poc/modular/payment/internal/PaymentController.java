package com.poc.modular.payment.internal;

import com.poc.modular.payment.PaymentApi;
import com.poc.modular.payment.PaymentView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

  private final PaymentApi paymentApi;

  public PaymentController(PaymentApi paymentApi) {
    this.paymentApi = paymentApi;
  }

  @GetMapping("/order/{orderId}")
  public PaymentView byOrder(@PathVariable Long orderId) {
    return paymentApi.getByOrderId(orderId);
  }
}
