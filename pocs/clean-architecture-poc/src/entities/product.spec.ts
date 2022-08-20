import Product from "./product";

describe("Product", () => {
  it("should have an id", () => {
    const product = new Product("1", "product");
    expect(product.getId()).toBeDefined();
  });

  it("should have a name", () => {
    const product = new Product("1", "product");
    expect(product.getName()).toBe("product");

    product.setName("product 1");

    expect(product.getName()).toBe("product 1");
  });

  it("should throw an error if the cost is lower than zero", () => {
    const product = new Product("1", "product");

    expect(() => {
      product.setCost(-1);
    }).toThrowError("Cost must be greater than zero");
  });

  it("should set the cost of a product", () => {
    const product = new Product("1", "product");
    product.setCost(100);
    expect(product.getCost()).toBe(100);
  });

  it("should set the sales price by 3 times the cost of the product", () => {
    const product = new Product("1", "product");
    product.setCost(100);
    expect(product.getSalesPrice()).toBe(300);
  });
});
