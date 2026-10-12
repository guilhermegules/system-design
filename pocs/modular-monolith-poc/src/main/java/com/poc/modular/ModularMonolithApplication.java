package com.poc.modular;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ModularMonolithApplication {

  public static void main(String[] args) {
    SpringApplication.run(ModularMonolithApplication.class, args);
  }
}