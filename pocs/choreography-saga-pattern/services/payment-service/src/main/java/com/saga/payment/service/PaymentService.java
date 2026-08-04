package com.saga.payment.service;

import tools.jackson.databind.ObjectMapper;
import com.saga.payment.domain.Payment;
import com.saga.payment.events.EventEnvelope;
import com.saga.payment.events.InventoryReservedPayload;
import com.saga.payment.repository.PaymentRepository;
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
    private final OutboxService outbox;
    private final ObjectMapper mapper;

    public PaymentService(PaymentRepository paymentRepo, OutboxService outbox, ObjectMapper mapper) {
        this.paymentRepo = paymentRepo;
        this.outbox = outbox;
        this.mapper = mapper;
    }

    @Transactional
    public void handleInventoryReserved(EventEnvelope envelope) {
        InventoryReservedPayload payload = mapper.convertValue(envelope.payload(), InventoryReservedPayload.class);
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
