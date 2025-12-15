package br.com.alura.loja.discount;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class DiscountCalculator {
	
	public BigDecimal calculate(Budget budget) {
		Discount discount = new BudgetDiscountForMoreThanFiveItems(
				new BudgetDiscountWithValueBiggerThanFiveHundred(
						new WithoutDiscount()));
		return discount.calculate(budget);
	}

}
