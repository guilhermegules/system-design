import {
  CreateProductInputDto,
  CreateProductOutputDto,
} from "../../use-cases/create-product.dto";

export default interface CreateProductPort {
  execute(input: CreateProductInputDto): Promise<CreateProductOutputDto>;
}