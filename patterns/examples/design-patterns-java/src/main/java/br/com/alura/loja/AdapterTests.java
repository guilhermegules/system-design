package br.com.alura.loja;

import br.com.alura.loja.budget.Budget;
import br.com.alura.loja.budget.BudgetItem;
import br.com.alura.loja.budget.BudgetRegister;
import br.com.alura.loja.http.JavaHttpClient;

import java.math.BigDecimal;

public class AdapterTests {
    public static void main(String[] args) {
        Budget budget = new Budget();
        budget.addListItem(new BudgetItem(BigDecimal.TEN));
        budget.approve();
        budget.complete();

        BudgetRegister budgetRegister = new BudgetRegister(new JavaHttpClient());
        budgetRegister.register(budget);
    }
}
