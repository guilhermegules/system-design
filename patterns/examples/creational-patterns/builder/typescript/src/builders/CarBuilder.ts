import { Car } from "../models/Car.model";
import { ICarBuilder } from "./../interfaces/CarBuilder.interface";

export class CarBuilder implements ICarBuilder {
  private car: Car;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.car = new Car();
  }

  setSeats(number: number): void {
    this.car.setSeats(number);
  }

  setEngine(parts: string[]): void {
    this.car.setEngineParts(parts);
  }

  getCar(): Car {
    const car = this.car;
    this.reset();
    return car;
  }
}
