package com.poc.modular.shared;

public class NotFoundException extends RuntimeException {

  public NotFoundException(String message) {
    super(message);
  }
}