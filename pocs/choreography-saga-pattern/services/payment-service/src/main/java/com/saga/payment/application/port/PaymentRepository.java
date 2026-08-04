package com.saga.payment.application.port;

import com.saga.payment.domain.Payment;

public interface PaymentRepository {

    void save(Payment payment);
}
