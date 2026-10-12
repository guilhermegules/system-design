package com.poc.modular.payment;

public interface PaymentApi {

  PaymentView getByOrderId(Long orderId);
}
