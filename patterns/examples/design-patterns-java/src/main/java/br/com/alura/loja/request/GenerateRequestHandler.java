package br.com.alura.loja.request;

import java.time.LocalDateTime;
import java.util.List;

import br.com.alura.loja.budget.Budget;
import br.com.alura.loja.budget.BudgetItem;
import br.com.alura.loja.request.actions.RequestAction;

public class GenerateRequestHandler {

	private final List<RequestAction> requestActions;

	public GenerateRequestHandler(List<RequestAction> requestActions) {
		this.requestActions = requestActions;
	}

	public void execute(GenerateRequest generateRequest) {
		Budget budget = new Budget();
		budget.addListItem(new BudgetItem(generateRequest.budgetValue()));
		Request request = new Request(generateRequest.client(), LocalDateTime.now(), budget);

		this.requestActions.forEach(requestAction -> requestAction.execute(request));
	}
}
