package br.com.alura.loja.http;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public class JavaHttpClient implements HttpAdapter {
    @Override
    public void request(String url, Map<String, Object> data) {
        try {
            var apiUrl = new URL(url);
            var connection = apiUrl.openConnection();
            connection.connect();
        } catch (MalformedURLException e) {
            throw new RuntimeException("Request HTTP error", e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
