package com.poc.modular.catalog;

import java.util.List;

public interface ProductApi {

  ProductView getRequired(Long productId);

  List<ProductView> findAll();
}