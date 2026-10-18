package com.poc.layered.controller;

import com.poc.layered.dto.CreateProductRequest;
import com.poc.layered.dto.ProductResponse;
import com.poc.layered.dto.UpdateProductRequest;
import com.poc.layered.service.ProductService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductService productService;

  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  @PostMapping
  public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
    ProductResponse response = productService.create(request);
    return ResponseEntity.created(URI.create("/api/products/" + response.id())).body(response);
  }

  @GetMapping
  public List<ProductResponse> list() {
    return productService.list();
  }

  @GetMapping("/{id}")
  public ProductResponse get(@PathVariable Long id) {
    return productService.get(id);
  }

  @PutMapping("/{id}")
  public ProductResponse update(@PathVariable Long id,
      @Valid @RequestBody UpdateProductRequest request) {
    return productService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
