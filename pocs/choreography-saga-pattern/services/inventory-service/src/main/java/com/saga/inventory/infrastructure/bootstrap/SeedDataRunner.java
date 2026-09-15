package com.saga.inventory.infrastructure.bootstrap;

import com.saga.inventory.application.port.StockRepository;
import com.saga.inventory.domain.StockItem;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SeedDataRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(SeedDataRunner.class);

  private final StockRepository repo;

  public SeedDataRunner(StockRepository repo) {
    this.repo = repo;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (repo.count() > 0) {
      return;
    }
    List<StockItem> seeds =
        List.of(
            new StockItem("sku-1", "Wireless Mouse", 100),
            new StockItem("sku-2", "Mechanical Keyboard", 50),
            new StockItem("sku-3", "27\" Monitor", 20),
            new StockItem("sku-4", "USB-C Hub", 80),
            new StockItem("sku-5", "Laptop Stand", 60));
    repo.saveAll(seeds);
    log.info("seeded {} stock items", seeds.size());
  }
}
