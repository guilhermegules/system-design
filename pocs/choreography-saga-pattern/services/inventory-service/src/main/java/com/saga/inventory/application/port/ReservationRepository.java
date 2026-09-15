package com.saga.inventory.application.port;

import com.saga.inventory.domain.Reservation;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository {

  List<Reservation> findByOrderIdAndStatus(UUID orderId, Reservation.Status status);

  void save(Reservation reservation);
}
