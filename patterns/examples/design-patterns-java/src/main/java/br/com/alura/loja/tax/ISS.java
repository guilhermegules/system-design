package br.com.alura.loja.tax;

import java.math.BigDecimal;

import br.com.alura.loja.budget.Budget;

public class ISS extends Tax {

	public ISS(Tax extraTax) {
		super(extraTax);
	}

	public BigDecimal makeCalculation(Budget budget) {
		return budget.value().multiply(new BigDecimal("0.06"));
	}

}
