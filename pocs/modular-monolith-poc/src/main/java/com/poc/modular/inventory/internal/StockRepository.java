package com.poc.modular.inventory.internal;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<StockItem, Long> {

  Optional<StockItem> findByProductId(Long productId);
}