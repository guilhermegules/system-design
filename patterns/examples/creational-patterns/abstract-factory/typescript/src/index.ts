import { ProductFactory, ProductFactoryTwo } from "./factories/ProductFactory";
import { AbstractProductFactory } from "./interfaces/Products.interface";

function clientCode(factory: AbstractProductFactory) {
  const victorian = factory.createVictorian();
  const modern = factory.createModern();

  console.log(victorian.contemplate());
  console.log(victorian.lookTheModernProduct(modern));
}

console.log("Client: Testing client code with the Product Factory");
clientCode(new ProductFactory());

console.log("\n");

console.log("Client: Testing the same cliente code with the seconde Product Factory");
clientCode(new ProductFactoryTwo());

