package com.poc.layered.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OrderFlowIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void placingOrderDecrementsStock() throws Exception {
    String body =
        """
        {
          "customerName": "Alice",
          "items": [{"productId": 1, "quantity": 2}]
        }
        """;

    mockMvc.perform(post("/api/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("PLACED"))
        .andExpect(jsonPath("$.total").value(240.0))
        .andExpect(jsonPath("$.items[0].sku").value("SKU-001"));

    mockMvc.perform(get("/api/products/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.stock").value(23));
  }

  @Test
  void invalidProductRequestIsRejected() throws Exception {
    String body =
        """
        {"sku": "", "name": "Broken", "price": -1, "stock": 0}
        """;

    mockMvc.perform(post("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isBadRequest());
  }
}
