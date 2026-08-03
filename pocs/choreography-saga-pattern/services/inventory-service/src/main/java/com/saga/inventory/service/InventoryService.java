package com.saga.inventory.service;

import tools.jackson.databind.ObjectMapper;
import com.saga.inventory.domain.Reservation;
import com.saga.inventory.domain.StockItem;
import com.saga.inventory.events.EventEnvelope;
import com.saga.inventory.events.OrderCancelledPayload;
import com.saga.inventory.events.OrderCreatedPayload;
import com.saga.inventory.repository.ReservationRepository;
import com.saga.inventory.repository.StockItemRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final StockItemRepository stockRepo;
    private final ReservationRepository reservationRepo;
    private final OutboxService outbox;
    private final ObjectMapper mapper;

    public InventoryService(
            StockItemRepository stockRepo,
            ReservationRepository reservationRepo,
            OutboxService outbox,
            ObjectMapper mapper) {
        this.stockRepo = stockRepo;
        this.reservationRepo = reservationRepo;
        this.outbox = outbox;
        this.mapper = mapper;
    }

    @Transactional
    public void handleOrderCreated(EventEnvelope envelope) {
        OrderCreatedPayload payload = mapper.convertValue(envelope.payload(), OrderCreatedPayload.class);
        UUID orderId = payload.orderId();

        boolean simulateFailure = "inventory_failure".equals(payload.simulate());
        boolean canReserve = !simulateFailure && payload.items().stream().allMatch(this::hasEnoughStock);

        if (!canReserve) {
            log.warn("cannot reserve stock for order {}", orderId);
            outbox.enqueue("inventory.reservation-failed", orderId,
                    Map.of("orderId", orderId.toString(), "reason", "INSUFFICIENT_STOCK"));
            return;
        }

        UUID firstReservationId = null;
        for (OrderCreatedPayload.Item item : payload.items()) {
            StockItem stock = stockRepo.findByProductId(item.productId()).orElseThrow();
            stock.setQuantity(stock.getQuantity() - item.quantity());
            stockRepo.save(stock);

            Reservation reservation = new Reservation();
            reservation.setOrderId(orderId);
            reservation.setProductId(item.productId());
            reservation.setQuantity(item.quantity());
            reservation.setStatus(Reservation.Status.ACTIVE);
            reservation.setCreatedAt(Instant.now());
            reservationRepo.save(reservation);
            if (firstReservationId == null) {
                firstReservationId = reservation.getId();
            }
        }

        outbox.enqueue("inventory.reserved", orderId, Map.of(
                "orderId", orderId.toString(),
                "reservationId", firstReservationId.toString(),
                "simulate", payload.simulate() == null ? "" : payload.simulate()));
        log.info("stock reserved for order {}", orderId);
    }

    @Transactional
    public void handleOrderCancelled(EventEnvelope envelope) {
        OrderCancelledPayload payload = mapper.convertValue(envelope.payload(), OrderCancelledPayload.class);
        List<Reservation> active = reservationRepo.findByOrderIdAndStatus(payload.orderId(), Reservation.Status.ACTIVE);
        for (Reservation reservation : active) {
            reservation.setStatus(Reservation.Status.RELEASED);
            reservationRepo.save(reservation);

            StockItem stock = stockRepo.findByProductId(reservation.getProductId()).orElse(null);
            if (stock != null) {
                stock.setQuantity(stock.getQuantity() + reservation.getQuantity());
                stockRepo.save(stock);
            }
        }
        if (!active.isEmpty()) {
            log.info("released {} reservation(s) for order {}", active.size(), payload.orderId());
        }
    }

    private boolean hasEnoughStock(OrderCreatedPayload.Item item) {
        return stockRepo.findByProductId(item.productId())
                .map(stock -> stock.getQuantity() >= item.quantity())
                .orElse(false);
    }
}
