package com.poc.modular.inventory;

public interface StockApi {

  int available(Long productId);

  void setStock(Long productId, int quantity);
}