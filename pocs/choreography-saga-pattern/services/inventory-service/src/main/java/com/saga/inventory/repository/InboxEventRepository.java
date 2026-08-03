package com.saga.inventory.repository;

import com.saga.inventory.domain.InboxEvent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InboxEventRepository extends JpaRepository<InboxEvent, UUID> {
}
