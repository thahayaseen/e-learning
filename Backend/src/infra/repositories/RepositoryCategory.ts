import { Ioption } from "../../app/dtos/categoryDTO";
import IRcategory from "../../domain/repository/Icategory.repository";
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
  async getAllCategory({
    page = 1,
    limit = 10,
    search,
  }: Ioption): Promise<{ data: ICategory[]; total: number }> {
    const skip = (page - 1) * limit;
    const data = await Category.find({
      Category: { $regex: search, $options: "i" },
    })
      .skip(skip)
      .limit(limit);
    const total = await Category.countDocuments({
      Category: { $regex: search, $options: "i" },
    });
    return { data, total };
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
