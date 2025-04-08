import IRcategory from "../../domain/repository/IRcategory";
import Category, { ICategory } from "../database/models/Category";

export class RepositoryCategory implements IRcategory {
  async createCategory(name: string, description: string): Promise<ICategory> {
    return await Category.create({
      Category: name,
      Description: description,
    });
  }
  async getCategorywithname(name: string): Promise<ICategory | null> {
    return await Category.findOne({ Category: name });
  }
  async getAllCategory(): Promise<ICategory[]> {
    return await Category.find();
  }
  async action(id: string, action: boolean): Promise<void> {
    await Category.findByIdAndUpdate(id, { unlist: action });

    return;
  }
  async editCategoy(id: string, data: ICategory): Promise<void> {
    await Category.findByIdAndUpdate(id, { $set: data });
    return;
  }
}
