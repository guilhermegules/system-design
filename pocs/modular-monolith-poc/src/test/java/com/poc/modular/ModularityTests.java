package com.poc.modular;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModule;
import org.springframework.modulith.core.ApplicationModules;

class ModularityTests {

  private final ApplicationModules modules =
      ApplicationModules.of(ModularMonolithApplication.class);

  @Test
  void verifiesModularStructure() {
    modules.verify();
  }

  @Test
  void exposesExpectedModules() {
    assertThat(modules.stream().map(module -> module.getIdentifier().toString()))
        .containsExactlyInAnyOrder("catalog", "events", "inventory", "orders", "payment", "shared");
  }
}
