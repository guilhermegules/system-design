package com.saga.inventory.infrastructure.adapter.out.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaInboxEventRepository extends JpaRepository<InboxEventEntity, UUID> {}
