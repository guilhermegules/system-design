package com.architecture.pipeline;

import com.architecture.pipeline.annotations.Filter;
import com.architecture.pipeline.model.EnrichedTransaction;
import com.architecture.pipeline.model.Transaction;
import com.architecture.pipeline.service.FinancialPipelineService;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        System.out.println("Starting Java Annotated Pipeline (Pipes and Filters)...");

        FinancialPipelineService service = new FinancialPipelineService();

        // Print reflective analysis of annotations
        System.out.println("\n--- Discovered Pipeline Filters via Reflection ---");
        for (Method method : service.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(Filter.class)) {
                Filter filter = method.getAnnotation(Filter.class);
                System.out.printf("  [Discovered Filter] Type: %-12s | Name: %-30s | Description: %s%n",
                    filter.type(), filter.name(), filter.description());
            }
        }
        System.out.println("--------------------------------------------------\n");

        // 1. PRODUCER: Pipe 1
        System.out.println("[Producer] Fetching raw transactions...");
        List<Transaction> rawTransactions = service.produceTransactions();

        // 2. TESTER: Pipe 1 -> Tester -> Pipe 2
        System.out.println("[Tester] Validating compliance criteria...");
        List<Transaction> validTransactions = rawTransactions.stream()
            .filter(tx -> {
                boolean isValid = service.validateTransaction(tx);
                if (!isValid) {
                    System.out.printf("  [Tester] Discarded non-compliant transaction: %s ($%.2f %s)%n",
                        tx.id(), tx.amount(), tx.currency());
                }
                return isValid;
            })
            .toList();

        // 3. TRANSFORMER: Pipe 2 -> Transformer -> Pipe 3
        System.out.println("[Transformer] Normalizing currency & computing tax...");
        List<EnrichedTransaction> enrichedList = validTransactions.stream()
            .map(service::transformTransaction)
            .toList();

        // 4. MAPREDUCE TRANSFORMER: Pipe 3 -> MapReduce -> Pipe 4
        System.out.println("[MapReduce] Grouping and aggregating volumes...");
        Map<String, Double> currencyAggregation = service.aggregateByCurrency(enrichedList);

        // 5. CONSUMER: Pipe 4 -> Consumer (Terminal Sink)
        System.out.println("[Consumer] Writing executive audit report...");
        service.consumeReport(enrichedList, currencyAggregation);

        System.out.println("Java Pipeline execution finished successfully.");
    }
}
