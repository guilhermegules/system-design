package com.poc.modular.payment.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private Long orderId;

  @Column(nullable = false, unique = true)
  private String reference;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false)
  private BigDecimal amount;

  @Column(nullable = false)
  private String currency;

  @Column(nullable = false)
  private Instant createdAt;

  protected Payment() {
  }

  public Payment(Long orderId, String reference, String status, BigDecimal amount,
      String currency) {
    this.orderId = orderId;
    this.reference = reference;
    this.status = status;
    this.amount = amount;
    this.currency = currency;
    this.createdAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public Long getOrderId() {
    return orderId;
  }

  public String getReference() {
    return reference;
  }

  public String getStatus() {
    return status;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getCurrency() {
    return currency;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
