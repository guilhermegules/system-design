package com.poc.modular.orders;

import java.util.List;

public interface OrderApi {

  OrderView place(PlaceOrderCommand command);

  OrderView getRequired(Long orderId);

  List<OrderView> findAll();
}