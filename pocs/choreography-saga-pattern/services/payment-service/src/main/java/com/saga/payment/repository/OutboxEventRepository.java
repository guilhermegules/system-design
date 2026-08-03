package com.saga.payment.repository;

import com.saga.payment.domain.OutboxEvent;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    Page<OutboxEvent> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
}
