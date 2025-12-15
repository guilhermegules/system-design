package br.com.alura.loja;

import br.com.alura.loja.budget.Budget;
import br.com.alura.loja.budget.BudgetItem;
import br.com.alura.loja.tax.ICMS;
import br.com.alura.loja.tax.ISS;
import br.com.alura.loja.tax.TaxCalculator;

import java.math.BigDecimal;

public class TaxesTests {
    public static void main(String[] args) {
        var budget = new Budget();
        budget.addListItem(new BudgetItem(new BigDecimal("100")));
        var calculator = new TaxCalculator();
        System.out.println(calculator.calculate(budget, new ISS(new ICMS(null))));
    }
}
