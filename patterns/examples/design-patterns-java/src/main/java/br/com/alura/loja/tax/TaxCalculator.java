package br.com.alura.loja.tax;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class TaxCalculator {

	public BigDecimal calculate(Budget budget, Tax tax) {
		return tax.calculate(budget);
	}

}
