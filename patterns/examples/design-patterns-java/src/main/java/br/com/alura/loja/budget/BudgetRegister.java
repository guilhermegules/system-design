package br.com.alura.loja.budget;

import br.com.alura.loja.DomainException;
import br.com.alura.loja.http.HttpAdapter;

import java.util.Map;

public class BudgetRegister {

    private HttpAdapter http;

    public BudgetRegister(HttpAdapter http) {
        this.http = http;
    }

    public void register(Budget budget) {
        if(!budget.isCompleted()) {
            throw new DomainException("Budget is not completed!");
        }

        var url = "https://jsonplaceholder.typicode.com/todos/1";
        Map<String, Object> data = Map.of(
                "value", budget.value(),
                "itemsQuantity", budget.getItemsQuantity()
        );
        this.http.request(url, data);
        System.out.println("Budget registered");
    }
}
