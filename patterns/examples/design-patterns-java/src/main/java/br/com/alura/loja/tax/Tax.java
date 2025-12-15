package br.com.alura.loja.tax;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public abstract class Tax {
	private final Tax extraTax;

	public Tax(Tax extraTax) {
		this.extraTax = extraTax;
	}

	protected abstract BigDecimal makeCalculation(Budget budget);

	public BigDecimal calculate(Budget budget) {
		var taxValue = makeCalculation(budget);
		var extraTaxValue = BigDecimal.ZERO;

		if(extraTax != null) {
			extraTaxValue = extraTax.makeCalculation(budget);
		}

		return taxValue.add(extraTaxValue);
	}
}
