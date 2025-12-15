package br.com.alura.loja.budget.situation;

import java.math.BigDecimal;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.budget.Budget;

public class Approved extends BudgetSituation {

	@Override
	public BigDecimal extraDiscountCalculation(Budget budget) {
		return budget.value().multiply(new BigDecimal("0.02"));
	}

	@Override
	public void complete(Budget budget) throws DomainException {
		budget.setSituation(new Completed());
	}

}
