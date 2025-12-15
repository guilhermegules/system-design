package br.com.alura.loja.budget;

import java.math.BigDecimal;

public record BudgetItem(BigDecimal value) implements Budgetable {
}
