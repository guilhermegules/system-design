import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "products", timestamps: false })
export default class ProductModel extends Model {
  @PrimaryKey
  @Column({ type: "string" })
  id: string;

  @Column({ type: "string" })
  name: string;

  @Column({ type: "number" })
  cost: number;

  @Column({ type: "number" })
  salesPrice: number;
}
