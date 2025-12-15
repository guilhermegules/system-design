package br.com.alura.loja.discount;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public abstract class Discount {

	protected Discount next;

	public Discount(Discount next) {
		this.next = next;
	}

	public BigDecimal calculate(Budget budget) {
		if (shouldApplyDiscount(budget)) {
			return makeCalculation(budget);
		}
		
		return next.calculate(budget);
	}
	
	public abstract BigDecimal makeCalculation(Budget budget);
	public abstract boolean shouldApplyDiscount(Budget budget);

}
