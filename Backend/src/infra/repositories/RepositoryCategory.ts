import IRcategory from "../../domain/repository/IRcategory";
import Category, { ICategory } from "../database/models/Category";

export class RepositoryCategory implements IRcategory {
  async createCategory(name: string, description: string): Promise<ICategory> {
    return await Category.create({
      Category: name,
      Description: description,
    });
  }
  async getAllCategory(): Promise<ICategory[]> {
    return await Category.find();
  }
  async deleteCategory(id: string): Promise<void> {
    await Category.deleteOne({ _id: id });
    return;
  }
  async editCategoy(id: string, data: ICategory):Promise<void> {
    await Category.findByIdAndUpdate(id, { $set: data });
    return
  }
}
