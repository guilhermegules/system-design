package com.saga.inventory.repository;

import com.saga.inventory.domain.OutboxEvent;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    Page<OutboxEvent> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
}
