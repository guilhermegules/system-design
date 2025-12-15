export interface ICarBuilder {
  reset(): void;
  setSeats(number: number): void;
  setEngine(parts: string[]): void;
}
