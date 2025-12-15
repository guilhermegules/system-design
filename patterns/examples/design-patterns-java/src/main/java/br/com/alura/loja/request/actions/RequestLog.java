package br.com.alura.loja.request.actions;

import br.com.alura.loja.request.Request;

public class RequestLog implements RequestAction {

  @Override
  public void execute(Request request) {
    System.out.println("Request generated: " + request);
  }
}
