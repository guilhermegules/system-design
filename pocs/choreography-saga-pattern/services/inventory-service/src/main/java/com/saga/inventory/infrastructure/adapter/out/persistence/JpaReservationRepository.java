package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.domain.Reservation;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaReservationRepository extends JpaRepository<ReservationEntity, UUID> {

    List<ReservationEntity> findByOrderIdAndStatus(UUID orderId, Reservation.Status status);
}
