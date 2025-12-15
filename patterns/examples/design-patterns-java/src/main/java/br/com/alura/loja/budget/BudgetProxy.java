package br.com.alura.loja.budget;

import java.math.BigDecimal;

public class BudgetProxy implements Budgetable {
  private BigDecimal value;
  private final Budget budget;

  public BudgetProxy(Budget budget) {
    this.budget = budget;
  }

  public BigDecimal value() {
    if(value == null) {
      value = budget.value();
    }

    return value;
  }


}
