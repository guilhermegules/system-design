package br.com.alura.loja;

import br.com.alura.loja.budget.Budget;
import br.com.alura.loja.budget.BudgetItem;

import br.com.alura.loja.budget.BudgetProxy;
import java.math.BigDecimal;

public class CompositionTests {
    public static void main(String[] args) {
        var oldBudget = new Budget();
        oldBudget.addListItem(new BudgetItem(new BigDecimal("100")));
        oldBudget.reject();

        var budget = new Budget();
        budget.addListItem(new BudgetItem(new BigDecimal("500")));
        budget.addListItem(oldBudget);

        var budgetProxy = new BudgetProxy(budget);

        System.out.println(budgetProxy.value());
        System.out.println(budgetProxy.value());
    }
}
