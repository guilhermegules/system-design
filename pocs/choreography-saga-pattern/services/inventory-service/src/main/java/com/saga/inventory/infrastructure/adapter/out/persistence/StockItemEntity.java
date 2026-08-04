package com.saga.inventory.infrastructure.adapter.out.persistence;

import com.saga.inventory.domain.StockItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "stock_items")
public class StockItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false, unique = true)
    private String productId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int quantity;

    public StockItemEntity() {
    }

    public static StockItemEntity fromDomain(StockItem item) {
        StockItemEntity entity = new StockItemEntity();
        entity.id = item.getId();
        entity.productId = item.getProductId();
        entity.name = item.getName();
        entity.quantity = item.getQuantity();
        return entity;
    }

    public StockItem toDomain() {
        return new StockItem(id, productId, name, quantity);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
