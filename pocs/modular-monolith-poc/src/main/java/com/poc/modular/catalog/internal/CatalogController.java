package com.poc.modular.catalog.internal;

import com.poc.modular.catalog.ProductView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class CatalogController {

  private final CatalogService catalogService;

  public CatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @PostMapping
  public ResponseEntity<ProductView> create(@Valid @RequestBody CreateProductRequest request) {
    ProductView view = catalogService.create(request.sku(), request.name(), request.price());
    return ResponseEntity.created(URI.create("/api/products/" + view.id())).body(view);
  }

  @GetMapping
  public List<ProductView> list() {
    return catalogService.findAll();
  }

  @GetMapping("/{id}")
  public ProductView get(@PathVariable Long id) {
    return catalogService.getRequired(id);
  }

  record CreateProductRequest(
      @NotBlank String sku,
      @NotBlank String name,
      @NotNull @Positive BigDecimal price) {
  }
}