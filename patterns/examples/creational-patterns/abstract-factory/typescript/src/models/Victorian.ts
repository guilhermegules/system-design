import { AbstractModern, AbstractVictorian } from "../interfaces/Products.interface";

export class Victorian implements AbstractVictorian {
  lookTheModernProduct(product: AbstractModern): string {
    return `looking at the modern product - ${product.print()}`;
  }

  contemplate(): string {
    return 'Contemplate the victorian architecture';
  }
}

export class VictorianTwo implements AbstractVictorian {
  lookTheModernProduct(product: AbstractModern): string {
    return `looking at the modern product - ${product.print()}`;
  }

  contemplate(): string {
    return 'Contemplate the victorian two architecture';
  }
}