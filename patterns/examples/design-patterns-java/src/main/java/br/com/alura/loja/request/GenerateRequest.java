package br.com.alura.loja.request;

import java.math.BigDecimal;

public record GenerateRequest(String client, BigDecimal budgetValue, int itemsQuantity) {


}
