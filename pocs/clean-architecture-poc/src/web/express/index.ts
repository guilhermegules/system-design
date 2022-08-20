import { Sequelize } from "sequelize-typescript";
import express from "express";
import { setupDb } from "./config/database.config";
import { productRouter } from "./route/product.routes";

export const app = express();

app.use(express.json());
app.use("/products", productRouter);

setupDb();
