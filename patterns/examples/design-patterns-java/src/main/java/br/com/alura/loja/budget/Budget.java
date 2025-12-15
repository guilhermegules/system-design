package br.com.alura.loja.budget;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import br.com.alura.loja.budget.situation.Completed;
import br.com.alura.loja.budget.situation.InReview;
import br.com.alura.loja.budget.situation.BudgetSituation;

public class Budget implements Budgetable {

	private BigDecimal value;
	private final List<Budgetable> items;
	private BudgetSituation situation;

	public Budget() {
		this.value = BigDecimal.ZERO;
		this.items = new ArrayList<>();
		this.situation = new InReview();
	}

	public void applyExtraDiscount() {
		var extraDiscount = this.situation.extraDiscountCalculation(this);
		this.value = this.value.subtract(extraDiscount);
	}
	
	public void approve() {
		this.situation.approve(this);
	}
	
	public void reject() {
		this.situation.reject(this);
	}
	
	public void complete() {
		this.situation.complete(this);
	}

	public BigDecimal value() {
		// Faking slow processing
		try {
			Thread.sleep(2000);
		} catch (InterruptedException interruptedException) {
			throw new RuntimeException();
		}
		return value;
	}

	public int getItemsQuantity() {
		return items.size();
	}

	public void setSituation(BudgetSituation situation) {
		this.situation = situation;
	}

	public boolean isCompleted() {
		return this.situation instanceof Completed;
	}

	public void addListItem(Budgetable budgetItem) {
		value = value.add(budgetItem.value());
		items.add(budgetItem);
	}
}
