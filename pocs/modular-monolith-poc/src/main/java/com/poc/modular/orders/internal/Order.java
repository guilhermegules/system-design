package com.poc.modular.orders.internal;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String reference;

  @Column(nullable = false)
  private String customerName;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false)
  private BigDecimal total;

  @Column(nullable = false)
  private Instant createdAt;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private List<OrderItem> items = new ArrayList<>();

  protected Order() {
  }

  public Order(String reference, String customerName, String status) {
    this.reference = reference;
    this.customerName = customerName;
    this.status = status;
    this.createdAt = Instant.now();
    this.total = BigDecimal.ZERO;
  }

  public void addItem(OrderItem item) {
    items.add(item);
    total = total.add(item.lineTotal());
  }

  public void transitionTo(String newStatus) {
    this.status = newStatus;
  }

  public Long getId() {
    return id;
  }

  public String getReference() {
    return reference;
  }

  public String getCustomerName() {
    return customerName;
  }

  public String getStatus() {
    return status;
  }

  public BigDecimal getTotal() {
    return total;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public List<OrderItem> getItems() {
    return items;
  }
}