import express from "express";
import ProductRepository from "../../../database/product.repository";
import { CreateProductInputDto } from "../../../use-cases/create-product/create-product.dto";
import CreateProductUseCase from "../../../use-cases/create-product/create-product.use-case";

export const productRouter = express.Router();

productRouter.post("/", async (request, response) => {
  const createProductUseCase = new CreateProductUseCase(
    new ProductRepository()
  );

  try {
    const productDto: CreateProductInputDto = {
      id: request.body.id,
      name: request.body.name,
      cost: request.body.cost,
    };
    const productOutput = await createProductUseCase.execute(productDto);
    response.status(200).send(productOutput);
  } catch (error) {
    response.status(500).send(error);
  }
});
