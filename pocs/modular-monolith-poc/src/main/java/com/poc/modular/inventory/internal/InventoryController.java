package com.poc.modular.inventory.internal;

import com.poc.modular.inventory.StockApi;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock")
public class InventoryController {

  private final StockApi stockApi;

  public InventoryController(StockApi stockApi) {
    this.stockApi = stockApi;
  }

  @GetMapping("/{productId}")
  public Map<String, Integer> available(@PathVariable Long productId) {
    return Map.of("quantity", stockApi.available(productId));
  }

  @PutMapping("/{productId}")
  public Map<String, Integer> setStock(@PathVariable Long productId,
      @RequestBody SetStockRequest request) {
    stockApi.setStock(productId, request.quantity());
    return available(productId);
  }

  record SetStockRequest(int quantity) {
  }
}