package com.saga.inventory.infrastructure.adapter.in.web;

import com.saga.inventory.infrastructure.bootstrap.SeedDataRunner;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal")
public class InternalController {

  private final SeedDataRunner seed;

  public InternalController(SeedDataRunner seed) {
    this.seed = seed;
  }

  @PostMapping("/seed")
  public Map<String, String> seed() {
    seed.run();
    return Map.of("status", "seeded");
  }
}
