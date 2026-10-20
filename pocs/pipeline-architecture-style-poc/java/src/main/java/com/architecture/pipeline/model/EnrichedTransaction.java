package com.architecture.pipeline.model;

public record EnrichedTransaction(
    String id,
    String userId,
    double originalAmount,
    String currency,
    double amountUSD,
    double taxUSD,
    double netUSD,
    double riskScore
) {}
