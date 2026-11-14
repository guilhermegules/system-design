package com.architecture.pipeline.model;

public record Transaction(
    String id,
    String userId,
    double amount,
    String currency,
    String channel
) {}
