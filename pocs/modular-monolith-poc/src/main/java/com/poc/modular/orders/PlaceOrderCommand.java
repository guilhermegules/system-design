package com.poc.modular.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record PlaceOrderCommand(
    @NotBlank String customerName,
    @NotEmpty @Valid List<Line> items) {

  public record Line(
      @NotNull Long productId,
      @Positive int quantity) {
  }
}