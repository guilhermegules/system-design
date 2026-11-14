package com.architecture.pipeline.service;

import com.architecture.pipeline.annotations.Filter;
import com.architecture.pipeline.annotations.FilterType;
import com.architecture.pipeline.model.EnrichedTransaction;
import com.architecture.pipeline.model.Transaction;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FinancialPipelineService {

    @Filter(type = FilterType.PRODUCER, name = "RawTransactionProducer", description = "Extracts transactions from data source")
    public List<Transaction> produceTransactions() {
        return List.of(
            new Transaction("TX-J01", "user-1", 1200.0, "USD", "web"),
            new Transaction("TX-J02", "user-2", -50.0, "USD", "pos"),
            new Transaction("TX-J03", "user-3", 850.0, "EUR", "mobile"),
            new Transaction("TX-J04", "user-4", 250000.0, "GBP", "wire"),
            new Transaction("TX-J05", "user-5", 420.0, "GBP", "web")
        );
    }

    @Filter(type = FilterType.TESTER, name = "SelectionRulesTester", description = "Validates compliance and fraud thresholds")
    public boolean validateTransaction(Transaction tx) {
        boolean validAmount = tx.amount() > 0.0 && tx.amount() <= 100000.0;
        boolean validCurrency = List.of("USD", "EUR", "GBP").contains(tx.currency());
        return validAmount && validCurrency;
    }

    @Filter(type = FilterType.TRANSFORMER, name = "CurrencyAndTaxTransformer", description = "Normalizes currency to USD and computes withholding tax")
    public EnrichedTransaction transformTransaction(Transaction tx) {
        double rate = switch (tx.currency()) {
            case "EUR" -> 1.08;
            case "GBP" -> 1.29;
            default -> 1.0;
        };

        double amountUSD = tx.amount() * rate;
        double taxUSD = amountUSD * 0.15;
        double netUSD = amountUSD - taxUSD;
        double riskScore = (amountUSD > 5000.0 || "wire".equals(tx.channel())) ? 0.75 : 0.15;

        return new EnrichedTransaction(
            tx.id(),
            tx.userId(),
            tx.amount(),
            tx.currency(),
            amountUSD,
            taxUSD,
            netUSD,
            riskScore
        );
    }

    @Filter(type = FilterType.TRANSFORMER, name = "MapReduceAnalyticsTransformer", description = "Groups by currency and calculates volume stats")
    public Map<String, Double> aggregateByCurrency(List<EnrichedTransaction> transactions) {
        return transactions.stream().collect(
            Collectors.groupingBy(
                EnrichedTransaction::currency,
                Collectors.summingDouble(EnrichedTransaction::amountUSD)
            )
        );
    }

    @Filter(type = FilterType.CONSUMER, name = "ExecutiveReportConsumer", description = "Terminal sink persisting audit metrics")
    public void consumeReport(List<EnrichedTransaction> transactions, Map<String, Double> volumeByCurrency) {
        double totalVolumeUSD = transactions.stream().mapToDouble(EnrichedTransaction::amountUSD).sum();
        double totalTaxUSD = transactions.stream().mapToDouble(EnrichedTransaction::taxUSD).sum();

        System.out.println("\n========== JAVA ANNOTATION PIPELINE REPORT ==========");
        System.out.printf("Total Valid Transactions: %d%n", transactions.size());
        System.out.printf("Total Volume (USD):       $%.2f%n", totalVolumeUSD);
        System.out.printf("Total Tax Retained:       $%.2f%n", totalTaxUSD);
        System.out.println("Volume Breakdown by Currency (MapReduce):");
        volumeByCurrency.forEach((currency, volume) ->
            System.out.printf("  • [%s]: $%.2f USD%n", currency, volume)
        );
        System.out.println("=====================================================\n");
    }
}
