package br.com.alura.loja.discount;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class BudgetDiscountForMoreThanFiveItems extends Discount {

	public BudgetDiscountForMoreThanFiveItems(Discount next) {
		super(next);
	}

	public BigDecimal makeCalculation(Budget budget) {
		return budget.value().multiply(new BigDecimal("0.1"));
	}

	@Override
	public boolean shouldApplyDiscount(Budget budget) {
		return budget.getItemsQuantity() > 5;
	}

}
