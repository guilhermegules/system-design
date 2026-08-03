package com.saga.inventory.repository;

import com.saga.inventory.domain.StockItem;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockItemRepository extends JpaRepository<StockItem, UUID> {

    Optional<StockItem> findByProductId(String productId);
}
