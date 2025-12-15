package br.com.alura.loja.budget.situation;

import java.math.BigDecimal;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.budget.Budget;

public abstract class BudgetSituation {

	public abstract BigDecimal extraDiscountCalculation(Budget budget);
	
	public void approve(Budget budget) throws DomainException {
		throw new DomainException("Orcamento nao pode ser aprovado!");
	}
	
	public void reject(Budget budget) throws DomainException {
		throw new DomainException("Orcamento nao pode ser reprovado!");
	}
	
	public void complete(Budget budget) throws DomainException {
		throw new DomainException("Orcamento nao pode ser finalizado!");
	}
}
