import Product from "../../entities/product";
import ProductGateway from "../../gateways/product.gateway";
import {
  CreateProductInputDto,
  CreateProductOutputDto,
} from "./create-product.dto";

export default class CreateProductUseCase {
  private productGateway: ProductGateway;

  constructor(productGateway: ProductGateway) {
    this.productGateway = productGateway;
  }

  async execute(input: CreateProductInputDto): Promise<CreateProductOutputDto> {
    const product = new Product(input.id, input.name);
    product.setCost(input.cost);

    await this.productGateway.create(product);

    return new Promise((resolve) => {
      resolve({
        id: product.getId(),
        cost: product.getCost(),
        salesPrice: product.getSalesPrice(),
        name: product.getName(),
      });
    });
  }
}
