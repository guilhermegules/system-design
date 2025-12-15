package br.com.alura.loja.budget.situation;

import java.math.BigDecimal;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.budget.Budget;

public class Completed extends BudgetSituation {

	@Override
	public BigDecimal extraDiscountCalculation(Budget budget) {
		throw new DomainException("Orcamento finalizado nao pode ter desconto extra!");
	}

}
