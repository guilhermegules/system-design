import express from "express";
import { productRouter } from "./product.routes";
import { setupDb } from "../../../../config/database";

export const app = express();

app.use(express.json());
app.use("/products", productRouter);

setupDb();