package com.saga.payment.repository;

import com.saga.payment.domain.InboxEvent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InboxEventRepository extends JpaRepository<InboxEvent, UUID> {
}
