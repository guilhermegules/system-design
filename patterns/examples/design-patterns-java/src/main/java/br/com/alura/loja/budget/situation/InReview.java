package br.com.alura.loja.budget.situation;

import java.math.BigDecimal;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.budget.Budget;

public class InReview extends BudgetSituation {

	@Override
	public BigDecimal extraDiscountCalculation(Budget budget) {
		return budget.value().multiply(new BigDecimal("0.05"));
	}

	@Override
	public void approve(Budget budget) throws DomainException {
		budget.setSituation(new Approved());
	}
	
	@Override
	public void reject(Budget budget) throws DomainException {
		budget.setSituation(new Rejected());
	}

}
