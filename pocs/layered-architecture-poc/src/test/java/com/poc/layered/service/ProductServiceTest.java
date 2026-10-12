package com.poc.layered.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.poc.layered.dto.CreateProductRequest;
import com.poc.layered.dto.ProductResponse;
import com.poc.layered.dto.UpdateProductRequest;
import com.poc.layered.entity.Product;
import com.poc.layered.exception.NotFoundException;
import com.poc.layered.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock
  private ProductRepository productRepository;

  @InjectMocks
  private ProductService productService;

  @Test
  void createPersistsProduct() {
    Product saved = new Product("SKU-9", "Standing Desk", new BigDecimal("199.00"), 5);
    when(productRepository.save(any(Product.class))).thenReturn(saved);

    ProductResponse response = productService.create(
        new CreateProductRequest("SKU-9", "Standing Desk", new BigDecimal("199.00"), 5));

    assertThat(response.sku()).isEqualTo("SKU-9");
    assertThat(response.stock()).isEqualTo(5);
  }

  @Test
  void getThrowsWhenProductMissing() {
    when(productRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> productService.get(99L))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("99");
  }

  @Test
  void updateModifiesExistingProduct() {
    Product existing = new Product("SKU-1", "Desk", new BigDecimal("100.00"), 3);
    when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

    ProductResponse response = productService.update(1L,
        new UpdateProductRequest("SKU-1", "Standing Desk", new BigDecimal("150.00"), 7));

    assertThat(response.name()).isEqualTo("Standing Desk");
    assertThat(response.price()).isEqualByComparingTo("150.00");
    assertThat(response.stock()).isEqualTo(7);
  }

  @Test
  void deleteRemovesExistingProduct() {
    when(productRepository.existsById(1L)).thenReturn(true);

    productService.delete(1L);

    verify(productRepository).deleteById(1L);
  }

  @Test
  void deleteThrowsWhenProductMissing() {
    when(productRepository.existsById(99L)).thenReturn(false);

    assertThatThrownBy(() -> productService.delete(99L))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("99");
    verify(productRepository, never()).deleteById(any());
  }
}
