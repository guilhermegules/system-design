import Product from "../../../domain/product";

export default interface ProductRepositoryPort {
  create(product: Product): Promise<void>;
}