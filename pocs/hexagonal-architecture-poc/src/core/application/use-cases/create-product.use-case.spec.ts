import CreateProductPort from "../ports/inbound/create-product.port";
import ProductRepositoryPort from "../ports/outbound/product.repository.port";
import { CreateProductInputDto } from "./create-product.dto";
import CreateProductUseCase from "./create-product.use-case";

describe("Create product use case", () => {
  it("should create a product", async () => {
    const input: CreateProductInputDto = {
      cost: 100,
      name: "phone",
      id: "1",
    };

    const productRepository: ProductRepositoryPort = {
      create: jest.fn(),
    };

    const createProductUseCase: CreateProductPort = new CreateProductUseCase(
      productRepository
    );
    const result = await createProductUseCase.execute(input);

    expect(result).toEqual({
      cost: 100,
      name: "phone",
      id: "1",
      salesPrice: 300,
    });
  });
});