import { Ioption } from "../../app/dtos/categoryDTO";
import { ICategory } from "../../infra/database/models/Category";

export default interface IRcategory {
  createCategory(name: string, description: string): Promise<ICategory>;
  getAllCategory(
    options: Ioption
  ): Promise<{ data: ICategory[]; total: number }>;
  action(id: string, action: boolean): Promise<void>;
  editCategoy(id: string, data: ICategory): Promise<void>;
  getCategorywithname(name: string): Promise<ICategory | null>;
}
