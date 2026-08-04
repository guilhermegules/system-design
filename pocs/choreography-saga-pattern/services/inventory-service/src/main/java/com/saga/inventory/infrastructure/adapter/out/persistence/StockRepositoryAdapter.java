package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.application.port.StockRepository;
import com.saga.inventory.domain.StockItem;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class StockRepositoryAdapter implements StockRepository {

    private final JpaStockItemRepository jpa;

    public StockRepositoryAdapter(JpaStockItemRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<StockItem> findByProductId(String productId) {
        return jpa.findByProductId(productId).map(StockItemEntity::toDomain);
    }

    @Override
    public void save(StockItem item) {
        StockItemEntity saved = jpa.save(StockItemEntity.fromDomain(item));
        item.setId(saved.getId());
    }

    @Override
    public void saveAll(List<StockItem> items) {
        jpa.saveAll(items.stream().map(StockItemEntity::fromDomain).toList());
    }

    @Override
    public long count() {
        return jpa.count();
    }
}
