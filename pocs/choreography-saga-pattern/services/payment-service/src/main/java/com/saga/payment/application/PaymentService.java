package com.saga.payment.application;

import com.saga.payment.application.port.OutboxRepository;
import com.saga.payment.application.port.PaymentRepository;
import com.saga.payment.domain.Payment;
import com.saga.payment.domain.event.InventoryReservedPayload;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepo;
    private final OutboxRepository outbox;

    public PaymentService(PaymentRepository paymentRepo, OutboxRepository outbox) {
        this.paymentRepo = paymentRepo;
        this.outbox = outbox;
    }

    @Transactional
    public void handleInventoryReserved(InventoryReservedPayload payload) {
        UUID orderId = payload.orderId();

        if ("payment_failure".equals(payload.simulate())) {
            log.warn("simulated payment failure for order {}", orderId);
            outbox.enqueue("payments.unauthorized", orderId, Map.of(
                    "orderId", orderId.toString(),
                    "paymentId", UUID.randomUUID().toString(),
                    "reason", "PAYMENT_UNAUTHORIZED"));
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(payload.totalAmount());
        payment.setCurrency(payload.currency());
        payment.setStatus("PROCESSED");
        payment.setCreatedAt(Instant.now());
        paymentRepo.save(payment);

        outbox.enqueue("payment.processed", orderId, Map.of(
                "orderId", orderId.toString(),
                "paymentId", payment.getId().toString(),
                "status", "PROCESSED"));
        log.info("payment processed for order {}", orderId);
    }
}
