package br.com.alura.loja.discount;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class WithoutDiscount extends Discount {

	public WithoutDiscount() {
		super(null);
	}

	public BigDecimal makeCalculation(Budget budget) {
		return BigDecimal.ZERO;
	}

	@Override
	public boolean shouldApplyDiscount(Budget budget) {
		return true;
	}

}
