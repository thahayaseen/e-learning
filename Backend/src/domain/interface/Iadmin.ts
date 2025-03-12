import { ICategory } from "../../infra/database/models/Category";

export interface IAdmin {
  getuserAdata(params: { page?: string; limit?: string }): Promise<any>;
  Blockuser(id: string, type: boolean): Promise<void>;
  createCategory(name: string, description: string): Promise<ICategory | void>;
  changeCategory(id: string, data: ICategory): Promise<void>;
  deleteCourse(id: string): Promise<void>;
}
