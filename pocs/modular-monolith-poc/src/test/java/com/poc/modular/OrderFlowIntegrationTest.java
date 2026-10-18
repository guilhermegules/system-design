package com.poc.modular;

import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
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
  void placingOrderReservesInventoryAsynchronously() throws Exception {
    String body =
        """
        {"customerName": "Alice", "items": [{"productId": 1, "quantity": 2}]}
        """;

    String location = mockMvc.perform(post("/api/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("PLACED"))
        .andExpect(jsonPath("$.total.amount").value(240.0))
        .andReturn().getResponse().getHeader("Location");
    long orderId = Long.parseLong(location.substring(location.lastIndexOf('/') + 1));

    await().atMost(Duration.ofSeconds(10))
        .untilAsserted(() -> mockMvc.perform(get("/api/stock/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantity").value(23)));

    await().atMost(Duration.ofSeconds(10))
        .untilAsserted(() -> mockMvc.perform(get("/api/orders/" + orderId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMED")));

    mockMvc.perform(get("/api/payments/order/" + orderId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("PROCESSED"))
        .andExpect(jsonPath("$.amount.amount").value(240.0));
  }
}