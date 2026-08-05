package com.saga.inventory.application.port;

import com.saga.inventory.domain.StockItem;
import java.util.List;
import java.util.Optional;

public interface StockRepository {

  Optional<StockItem> findByProductId(String productId);

  void save(StockItem item);

  void saveAll(List<StockItem> items);

  long count();
}
