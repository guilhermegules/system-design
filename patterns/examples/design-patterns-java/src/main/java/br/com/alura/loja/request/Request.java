package br.com.alura.loja.request;

import java.time.LocalDateTime;

import br.com.alura.loja.budget.Budget;

public record Request(String client, LocalDateTime date, Budget budget) {


}
