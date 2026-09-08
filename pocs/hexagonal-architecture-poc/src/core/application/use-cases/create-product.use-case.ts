import Product from "../../domain/product";
import CreateProductPort from "../ports/inbound/create-product.port";
import ProductRepositoryPort from "../ports/outbound/product.repository.port";
import {
  CreateProductInputDto,
  CreateProductOutputDto,
} from "./create-product.dto";

export default class CreateProductUseCase implements CreateProductPort {
  private productRepository: ProductRepositoryPort;

  constructor(productRepository: ProductRepositoryPort) {
    this.productRepository = productRepository;
  }

  async execute(input: CreateProductInputDto): Promise<CreateProductOutputDto> {
    const product = new Product(input.id, input.name);
    product.setCost(input.cost);

    await this.productRepository.create(product);

    return {
      id: product.getId(),
      cost: product.getCost(),
      salesPrice: product.getSalesPrice(),
      name: product.getName(),
    };
  }
}