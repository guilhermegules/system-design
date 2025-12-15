package br.com.alura.loja;

import br.com.alura.loja.request.actions.RequestLog;
import java.math.BigDecimal;
import java.util.Arrays;

import br.com.alura.loja.request.GenerateRequest;
import br.com.alura.loja.request.GenerateRequestHandler;
import br.com.alura.loja.request.actions.CreateRequest;
import br.com.alura.loja.request.actions.SendRequestByEmail;

public class RequestsTests {

	public static void main(String[] args) {
		String client = "Ana da Silva";
		BigDecimal budgetValue = new BigDecimal("745.99");
		int itemsQuantity = 3;
		
		GenerateRequest generateRequest = new GenerateRequest(client, budgetValue, itemsQuantity);
		GenerateRequestHandler handler = new GenerateRequestHandler(Arrays.asList(
				new SendRequestByEmail(),
				new CreateRequest(),
				new RequestLog()));

		handler.execute(generateRequest);
	}
}
