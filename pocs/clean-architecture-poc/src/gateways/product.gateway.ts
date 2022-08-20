import Product from "../entities/product";

export default interface ProductGateway {
  create(product: Product): Promise<void>;
}
