interface Shape {
  area(): number;
}

export class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

export class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number {
    return this.width * this.height;
  }
}

export class ShapeCalculator {
  calculate(shape: Shape): number {
    return shape.area();
  }
}
