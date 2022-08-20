export default class Product {
  private name: string;
  private cost: number;
  private id: string;

  constructor(id: string, name?: string) {
    this.name = name;
    this.id = id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  setCost(cost: number): void {
    if (cost < 0) throw new Error("Cost must be greater than zero");

    this.cost = cost;
  }

  getCost(): number {
    return this.cost;
  }

  getSalesPrice(): number {
    return this.cost * 3;
  }

  getId(): string {
    return this.id;
  }
}
