class AreaCalculator {
  calculate(shape: any): number {
    if (shape.type === "circle") {
      return Math.PI * shape.radius ** 2;
    }
    if (shape.type === "rectangle") {
      return shape.width * shape.height;
    }
    return 0;
  }
}
