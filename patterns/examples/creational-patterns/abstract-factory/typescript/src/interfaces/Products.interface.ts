export interface AbstractModern {
  print(): string;
}

export interface AbstractVictorian {
  contemplate(): string;
  lookTheModernProduct(product: AbstractModern): string
}

export interface AbstractProductFactory {
  createModern(): AbstractModern;
  createVictorian(): AbstractVictorian
}