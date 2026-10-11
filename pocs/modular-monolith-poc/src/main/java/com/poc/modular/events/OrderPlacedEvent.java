package com.poc.modular.events;

import com.poc.modular.shared.Money;
import java.util.List;

public record OrderPlacedEvent(Long orderId, Money total, List<Line> items) {

  public record Line(Long productId, int quantity) {
  }
}
