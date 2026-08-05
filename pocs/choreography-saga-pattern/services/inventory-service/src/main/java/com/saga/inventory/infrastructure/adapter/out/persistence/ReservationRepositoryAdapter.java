package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.application.port.ReservationRepository;
import com.saga.inventory.domain.Reservation;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ReservationRepositoryAdapter implements ReservationRepository {

  private final JpaReservationRepository jpa;

  public ReservationRepositoryAdapter(JpaReservationRepository jpa) {
    this.jpa = jpa;
  }

  @Override
  public List<Reservation> findByOrderIdAndStatus(UUID orderId, Reservation.Status status) {
    return jpa.findByOrderIdAndStatus(orderId, status).stream()
        .map(ReservationEntity::toDomain)
        .toList();
  }

  @Override
  public void save(Reservation reservation) {
    ReservationEntity saved = jpa.save(ReservationEntity.fromDomain(reservation));
    reservation.setId(saved.getId());
    reservation.setCreatedAt(saved.getCreatedAt());
  }
}
