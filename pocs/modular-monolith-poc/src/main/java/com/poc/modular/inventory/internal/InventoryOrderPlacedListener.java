package com.poc.modular.inventory.internal;

import com.poc.modular.events.OrderPlacedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class InventoryOrderPlacedListener {

  private final InventoryService inventoryService;

  public InventoryOrderPlacedListener(InventoryService inventoryService) {
    this.inventoryService = inventoryService;
  }

  @ApplicationModuleListener
  public void onOrderPlaced(OrderPlacedEvent event) {
    inventoryService.reserve(event.items());
  }
}