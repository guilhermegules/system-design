package com.poc.modular.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import com.poc.modular.events.OrderPlacedEvent;
import com.poc.modular.inventory.internal.StockItem;
import com.poc.modular.inventory.internal.StockRepository;
import com.poc.modular.shared.Money;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.ApplicationModuleTest.BootstrapMode;
import org.springframework.modulith.test.Scenario;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "spring.sql.init.mode=never")
@ApplicationModuleTest(mode = BootstrapMode.ALL_DEPENDENCIES)
class InventoryReservationTest {

  @Autowired
  private StockRepository stockRepository;

  @Test
  void reservesStockWhenOrderIsPlaced(Scenario scenario) {
    stockRepository.save(new StockItem(10L, 5));

    scenario.publish(new OrderPlacedEvent(1L, Money.of(new BigDecimal("240.00"), "USD"),
            List.of(new OrderPlacedEvent.Line(10L, 2))))
        .customize(cf -> cf.atMost(Duration.ofSeconds(10)).pollInterval(Duration.ofMillis(100)))
        .andWaitForStateChange(
            () -> stockRepository.findByProductId(10L).map(StockItem::getQuantity),
            quantity -> quantity.isPresent() && quantity.get() == 3)
        .andVerify(quantity -> assertThat(quantity).hasValue(3));
  }
}