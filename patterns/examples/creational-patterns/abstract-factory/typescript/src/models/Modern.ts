import { AbstractModern } from "../interfaces/Products.interface";

export  class Modern implements AbstractModern {
  print(): string {
    return "I'm the modern product";
  }
}

export class ModernTwo implements AbstractModern {
  print(): string {
    return "I'm the modern two product";
  }
}