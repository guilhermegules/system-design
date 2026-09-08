import { Request, Response } from "express";
import ProductRepository from "../../../outbound/persistence/sqlite/product.repository";
import { CreateProductInputDto } from "../../../../core/application/use-cases/create-product.dto";
import CreateProductUseCase from "../../../../core/application/use-cases/create-product.use-case";

export default class ProductController {
  async create(request: Request, response: Response): Promise<Response> {
    const createProductUseCase = new CreateProductUseCase(
      new ProductRepository()
    );

    const productInputDto: CreateProductInputDto = {
      id: request.body.id,
      name: request.body.name,
      cost: request.body.cost,
    };

    try {
      const productOutput = await createProductUseCase.execute(productInputDto);
      return response.status(200).send(productOutput);
    } catch (error) {
      return response.status(500).send(error);
    }
  }
}