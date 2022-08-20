import Product from "../entities/product";
import ProductGateway from "../gateways/product.gateway";
import ProductModel from "./product.model";

export default class ProductRepository implements ProductGateway {
  async create(product: Product): Promise<void> {
    await ProductModel.create({
      id: product.getId(),
      name: product.getName(),
      cost: product.getCost(),
      salesPrice: product.getSalesPrice(),
    });
  }
}
