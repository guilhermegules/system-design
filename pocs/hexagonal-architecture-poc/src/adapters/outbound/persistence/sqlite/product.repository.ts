import Product from "../../../../core/domain/product";
import ProductRepositoryPort from "../../../../core/application/ports/outbound/product.repository.port";
import ProductModel from "./product.model";

export default class ProductRepository implements ProductRepositoryPort {
  async create(product: Product): Promise<void> {
    await ProductModel.create({
      id: product.getId(),
      name: product.getName(),
      cost: product.getCost(),
      salesPrice: product.getSalesPrice(),
    });
  }
}