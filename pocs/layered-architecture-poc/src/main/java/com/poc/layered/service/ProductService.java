package com.poc.layered.service;

import com.poc.layered.dto.CreateProductRequest;
import com.poc.layered.dto.ProductResponse;
import com.poc.layered.dto.UpdateProductRequest;
import com.poc.layered.entity.Product;
import com.poc.layered.exception.NotFoundException;
import com.poc.layered.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

  private final ProductRepository productRepository;

  public ProductService(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @Transactional
  public ProductResponse create(CreateProductRequest request) {
    Product product = new Product(request.sku(), request.name(), request.price(), request.stock());
    return ProductResponse.from(productRepository.save(product));
  }

  @Transactional(readOnly = true)
  public ProductResponse get(Long id) {
    return ProductResponse.from(require(id));
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> list() {
    return productRepository.findAll().stream().map(ProductResponse::from).toList();
  }

  @Transactional
  public ProductResponse update(Long id, UpdateProductRequest request) {
    Product product = require(id);
    product.setSku(request.sku());
    product.setName(request.name());
    product.setPrice(request.price());
    product.setStock(request.stock());
    return ProductResponse.from(product);
  }

  @Transactional
  public void delete(Long id) {
    if (!productRepository.existsById(id)) {
      throw new NotFoundException("Product " + id + " not found");
    }
    productRepository.deleteById(id);
  }

  Product require(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
  }
}
