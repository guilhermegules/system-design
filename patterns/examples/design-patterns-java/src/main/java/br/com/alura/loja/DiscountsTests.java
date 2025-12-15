package br.com.alura.loja;

import java.math.BigDecimal;

import br.com.alura.loja.budget.BudgetItem;
import br.com.alura.loja.discount.DiscountCalculator;
import br.com.alura.loja.budget.Budget;

public class DiscountsTests {

	public static void main(String[] args) {
		var budgetItem1 = new BudgetItem(new BigDecimal("200"));
		var budgetItem2 = new BudgetItem(new BigDecimal("1000"));
		var budgetItem3 = new BudgetItem(new BigDecimal("500"));

		var first = new Budget();

		for (int i = 0; i < 6; i++) {
			first.addListItem(budgetItem1);
		}

		var second = new Budget();
		second.addListItem(budgetItem2);
		second.addListItem(budgetItem2);

		var third = new Budget();
		third.addListItem(budgetItem3);

		DiscountCalculator calculator = new DiscountCalculator();
		System.out.println(calculator.calculate(first));
		System.out.println(calculator.calculate(second));
		System.out.println(calculator.calculate(third));
	}

}
