package com.poc.modular.payment.internal;

import com.poc.modular.payment.PaymentApi;
import com.poc.modular.payment.PaymentView;
import com.poc.modular.shared.Money;
import com.poc.modular.shared.NotFoundException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService implements PaymentApi {

  private final PaymentRepository paymentRepository;

  public PaymentService(PaymentRepository paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  @Transactional
  public PaymentView charge(Long orderId, Money amount) {
    Payment payment = paymentRepository.save(new Payment(orderId, generateReference(), "PROCESSED",
        amount.amount(), amount.currency()));
    return toView(payment);
  }

  @Override
  @Transactional(readOnly = true)
  public PaymentView getByOrderId(Long orderId) {
    return paymentRepository.findByOrderId(orderId)
        .map(this::toView)
        .orElseThrow(() -> new NotFoundException("Payment for order " + orderId + " not found"));
  }

  private PaymentView toView(Payment payment) {
    return new PaymentView(payment.getId(), payment.getOrderId(), payment.getReference(),
        payment.getStatus(), Money.of(payment.getAmount(), payment.getCurrency()),
        payment.getCreatedAt());
  }

  private String generateReference() {
    return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
  }
}
