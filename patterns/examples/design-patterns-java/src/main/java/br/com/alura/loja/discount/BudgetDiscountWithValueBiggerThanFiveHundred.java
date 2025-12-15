package br.com.alura.loja.discount;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class BudgetDiscountWithValueBiggerThanFiveHundred extends Discount {

	public BudgetDiscountWithValueBiggerThanFiveHundred(Discount next) {
		super(next);
	}

	public BigDecimal makeCalculation(Budget budget) {
		return budget.value().multiply(new BigDecimal("0.05"));
	}

	@Override
	public boolean shouldApplyDiscount(Budget budget) {
		return budget.value().compareTo(new BigDecimal("500")) > 0;
	}

}
