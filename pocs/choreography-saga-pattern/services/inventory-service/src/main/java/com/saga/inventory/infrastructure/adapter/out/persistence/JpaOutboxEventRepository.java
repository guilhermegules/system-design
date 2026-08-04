package com.saga.inventory.infrastructure.adapter.out.persistence;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaOutboxEventRepository extends JpaRepository<OutboxEventEntity, UUID> {

    Page<OutboxEventEntity> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
}
