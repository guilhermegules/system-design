package com.poc.modular.inventory.internal;

import com.poc.modular.events.OrderPlacedEvent.Line;
import com.poc.modular.inventory.StockApi;
import com.poc.modular.shared.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService implements StockApi {

  private final StockRepository stockRepository;

  public InventoryService(StockRepository stockRepository) {
    this.stockRepository = stockRepository;
  }

  @Transactional
  public void reserve(List<Line> lines) {
    for (Line line : lines) {
      StockItem item = stockRepository.findByProductId(line.productId())
          .orElseThrow(() -> new NotFoundException(
              "Stock for product " + line.productId() + " not found"));
      item.decrement(line.quantity());
    }
  }

  @Override
  @Transactional
  public void setStock(Long productId, int quantity) {
    StockItem item = stockRepository.findByProductId(productId)
        .orElseGet(() -> new StockItem(productId, 0));
    item.setQuantity(quantity);
    stockRepository.save(item);
  }

  @Override
  @Transactional(readOnly = true)
  public int available(Long productId) {
    return stockRepository.findByProductId(productId)
        .map(StockItem::getQuantity)
        .orElse(0);
  }
}