import { Sequelize } from "sequelize-typescript";
import ProductModel from "../adapters/outbound/persistence/sqlite/product.model";

export let sequelize: Sequelize;

export async function setupDb(): Promise<void> {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  sequelize.addModels([ProductModel]);

  await sequelize.sync();
}