package br.com.alura.loja.http;

import java.util.Map;

public interface HttpAdapter {
    void request(String url, Map<String, Object> data);
}
