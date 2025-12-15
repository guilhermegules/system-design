package br.com.alura.loja.request.actions;

import br.com.alura.loja.request.Request;

public class CreateRequest implements RequestAction {

	public void execute(Request request) {
		System.out.println("Salvando pedido no banco de dados...");
	}

}
