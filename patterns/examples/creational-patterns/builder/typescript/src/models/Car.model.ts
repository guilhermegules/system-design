export class Car {
  private seats = 4;
  private engineParts = ["main engine"];

  getSeats(): number {
    return this.seats;
  }

  setSeats(seats: number) {
    this.seats = seats;
  }

  getEngineParts(): string[] {
    return this.engineParts;
  }

  setEngineParts(parts: string[]) {
    this.engineParts = parts;
  }

  listCarInfo() {
    console.log(`
      Car engine parts: ${this.engineParts.join(", ")}
      Car seats: ${this.seats}  
    `);
  }
}
