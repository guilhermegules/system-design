package com.poc.modular.orders;

import static org.assertj.core.api.Assertions.assertThat;

import com.poc.modular.events.PaymentFailedEvent;
import com.poc.modular.orders.internal.Order;
import com.poc.modular.orders.internal.OrderRepository;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.ApplicationModuleTest.BootstrapMode;
import org.springframework.modulith.test.Scenario;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "spring.sql.init.mode=never")
@ApplicationModuleTest(mode = BootstrapMode.ALL_DEPENDENCIES)
class OrderPaymentListenerTest {

  @Autowired
  private OrderRepository orderRepository;

  @Test
  void cancelsOrderWhenPaymentFails(Scenario scenario) {
    Order order = orderRepository.save(new Order("ORD-TEST", "Bob", "PLACED"));

    scenario.publish(new PaymentFailedEvent(order.getId(), "card declined"))
        .customize(cf -> cf.atMost(Duration.ofSeconds(10)).pollInterval(Duration.ofMillis(100)))
        .andWaitForStateChange(
            () -> orderRepository.findById(order.getId()).map(Order::getStatus),
            status -> status.isPresent() && "CANCELLED".equals(status.get()))
        .andVerify(status -> assertThat(status).hasValue("CANCELLED"));
  }
}
