import { Sequelize } from "sequelize-typescript";
import Product from "../entities/product";
import ProductModel from "./product.model";
import ProductRepository from "./product.repository";

describe("ProductRepository", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: {
        force: true,
      },
    });

    sequelize.addModels([ProductModel]);

    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const repository = new ProductRepository();
    const product = new Product("1", "Product 1");
    product.setCost(100);
    repository.create(product);

    const productResult = await ProductModel.findOne({ where: { id: "1" } });

    console.log(productResult);

    expect(productResult).toBeDefined();
    expect(productResult.getDataValue("id")).toBe(1);
    expect(productResult.getDataValue("name")).toBe("Product 1");
    expect(productResult.getDataValue("cost")).toBe(100);
    expect(productResult.getDataValue("salesPrice")).toBe(300);
  });
});
