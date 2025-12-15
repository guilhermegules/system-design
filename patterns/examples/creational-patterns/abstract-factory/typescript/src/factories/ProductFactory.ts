import { AbstractModern, AbstractProductFactory, AbstractVictorian } from "../interfaces/Products.interface";
import { Modern, ModernTwo } from "../models/Modern";
import { Victorian, VictorianTwo } from "../models/Victorian";

export class ProductFactory implements AbstractProductFactory {
  createModern(): AbstractModern {
    return new Modern();
  }

  createVictorian(): AbstractVictorian {
    return new Victorian();
  }
}

export class ProductFactoryTwo implements AbstractProductFactory {
  createModern(): AbstractModern {
    return new ModernTwo();
  }

  createVictorian(): AbstractVictorian {
    return new VictorianTwo();
  }
}