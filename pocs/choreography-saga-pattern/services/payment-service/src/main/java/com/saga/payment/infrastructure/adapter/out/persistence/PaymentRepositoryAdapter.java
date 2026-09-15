package com.saga.payment.infrastructure.adapter.out.persistence;

import com.saga.payment.application.port.PaymentRepository;
import com.saga.payment.domain.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentRepositoryAdapter implements PaymentRepository {

  private final JpaPaymentRepository jpa;

  public PaymentRepositoryAdapter(JpaPaymentRepository jpa) {
    this.jpa = jpa;
  }

  @Override
  public void save(Payment payment) {
    PaymentEntity saved = jpa.save(PaymentEntity.fromDomain(payment));
    payment.setId(saved.getId());
    payment.setCreatedAt(saved.getCreatedAt());
  }
}
