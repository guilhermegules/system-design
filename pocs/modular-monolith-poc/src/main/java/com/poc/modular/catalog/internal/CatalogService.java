package com.poc.modular.catalog.internal;

import com.poc.modular.catalog.ProductApi;
import com.poc.modular.catalog.ProductView;
import com.poc.modular.shared.Money;
import com.poc.modular.shared.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService implements ProductApi {

  private static final String CURRENCY = "USD";

  private final ProductRepository productRepository;

  public CatalogService(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @Transactional
  public ProductView create(String sku, String name, BigDecimal price) {
    Product product = productRepository.save(new Product(sku, name, price));
    return toView(product);
  }

  @Override
  @Transactional(readOnly = true)
  public ProductView getRequired(Long productId) {
    return toView(productRepository.findById(productId)
        .orElseThrow(() -> new NotFoundException("Product " + productId + " not found")));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ProductView> findAll() {
    return productRepository.findAll().stream().map(this::toView).toList();
  }

  private ProductView toView(Product product) {
    return new ProductView(product.getId(), product.getSku(), product.getName(),
        Money.of(product.getPrice(), CURRENCY));
  }
}