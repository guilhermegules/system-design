package br.com.alura.loja.budget.situation;

import java.math.BigDecimal;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.budget.Budget;

public class Rejected extends BudgetSituation {

	@Override
	public BigDecimal extraDiscountCalculation(Budget budget) {
		throw new DomainException("Orcamento reprovado nao pode ter desconto extra!");
	}

	@Override
	public void complete(Budget budget) throws DomainException {
		budget.setSituation(new Completed());
	}

}
