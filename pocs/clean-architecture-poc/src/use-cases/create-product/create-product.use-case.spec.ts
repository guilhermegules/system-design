import ProductGateway from "../../gateways/product.gateway";
import {
  CreateProductInputDto,
  CreateProductOutputDto,
} from "./create-product.dto";
import CreateProductUseCase from "./create-product.use-case";

describe("Create product use case", () => {
  it("should create a product", async () => {
    const input: CreateProductInputDto = {
      cost: 100,
      name: "phone",
      id: "1",
    };

    const output: CreateProductOutputDto = {
      cost: 100,
      name: "phone",
      id: "1",
      salesPrice: 300,
    };

    const productGateway: ProductGateway = {
      create: jest.fn(),
    };

    const createProductUseCase = new CreateProductUseCase(productGateway);
    const result = await createProductUseCase.execute(input);

    expect(result).toEqual(output);
  });
});
