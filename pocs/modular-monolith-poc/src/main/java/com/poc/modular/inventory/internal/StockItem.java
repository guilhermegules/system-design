package com.poc.modular.inventory.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stock_items")
public class StockItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private Long productId;

  @Column(nullable = false)
  private int quantity;

  protected StockItem() {
  }

  public StockItem(Long productId, int quantity) {
    this.productId = productId;
    this.quantity = quantity;
  }

  public void decrement(int amount) {
    if (amount <= 0) {
      throw new IllegalArgumentException("Amount must be greater than zero");
    }
    if (quantity < amount) {
      throw new IllegalArgumentException("Insufficient stock for product " + productId);
    }
    quantity -= amount;
  }

  public Long getId() {
    return id;
  }

  public Long getProductId() {
    return productId;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }
}