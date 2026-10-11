package com.poc.layered.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class ProductLifecycleIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void updatesAndDeletesProduct() throws Exception {
    String createBody =
        """
        {"sku": "SKU-100", "name": "Webcam", "price": 90.00, "stock": 4}
        """;
    String location = mockMvc.perform(post("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated())
        .andReturn().getResponse().getHeader("Location");
    long id = Long.parseLong(location.substring(location.lastIndexOf('/') + 1));

    String updateBody =
        """
        {"sku": "SKU-100", "name": "Webcam Pro", "price": 95.00, "stock": 9}
        """;
    mockMvc.perform(put("/api/products/" + id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(updateBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Webcam Pro"))
        .andExpect(jsonPath("$.stock").value(9));

    mockMvc.perform(delete("/api/products/" + id))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/products/" + id))
        .andExpect(status().isNotFound());
  }

  @Test
  void deletingUnknownProductReturnsNotFound() throws Exception {
    mockMvc.perform(delete("/api/products/424242"))
        .andExpect(status().isNotFound());
  }
}
