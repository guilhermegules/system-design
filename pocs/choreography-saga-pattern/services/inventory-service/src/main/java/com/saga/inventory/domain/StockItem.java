package com.saga.inventory.domain;

import java.util.UUID;

public class StockItem {

  private UUID id;
  private String productId;
  private String name;
  private int quantity;

  public StockItem() {}

  public StockItem(UUID id, String productId, String name, int quantity) {
    this.id = id;
    this.productId = productId;
    this.name = name;
    this.quantity = quantity;
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
