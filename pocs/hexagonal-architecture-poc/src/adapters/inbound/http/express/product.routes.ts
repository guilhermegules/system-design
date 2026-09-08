import { Router } from "express";
import ProductController from "./product.controller";

export const productRouter = Router();
const productController = new ProductController();

productRouter.post("/", (request, response) =>
  productController.create(request, response)
);