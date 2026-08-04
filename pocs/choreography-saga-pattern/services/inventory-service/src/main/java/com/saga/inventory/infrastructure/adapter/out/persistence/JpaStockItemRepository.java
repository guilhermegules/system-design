package com.saga.inventory.infrastructure.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaStockItemRepository extends JpaRepository<StockItemEntity, UUID> {

    Optional<StockItemEntity> findByProductId(String productId);
}
