package br.com.alura.loja.request.actions;

import br.com.alura.loja.request.Request;

public class SendRequestByEmail implements RequestAction {
	
	public void execute(Request request) {
		System.out.println("Enviando email para cliente sobre pedido...");
	}

}
