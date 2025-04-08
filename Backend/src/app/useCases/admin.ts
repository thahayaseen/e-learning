import IUserReposetory from "../../domain/repository/IUser";
import { IAdmin } from "../../domain/interface/Iadmin";
import IRcategory from "../../domain/repository/IRcategory";
import { SystemError } from "./enum/systemError";
import { HttpStatusCode } from "./enum/Status";
import { ICategory } from "../../infra/database/models/Category";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
class AppError extends Error {
  constructor(message: string, private statuscode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export default class Admin implements IAdmin {
  constructor(
    private UserRepository: IUserReposetory,
    private CategoryRepo: IRcategory,
    private CourseRepo: ICoursesRepository
  ) {}
  async getuserAdata({ page, limit }: { page?: string; limit?: string }) {
    try {
      const skip = (Number(page) - 1) * Number(limit);
      const data = await this.UserRepository.findAlluser(
        Number(limit),
        Number(skip)
      );
      if (!data) {
        throw "not fount";
      }
      return data;
    } catch (error: any) {
      new AppError(error.message, 404);
    }
  }
  async Blockuser(id: string, type: boolean) {
    try {
      console.log(id, "id is");

      await this.UserRepository.Blockuser(id, type);
      return;
      return;
    } catch (error: any) {
      new AppError(error.message, 404);
    }
  }
  async getCategoryNameUsecase(name: string): Promise<ICategory | null> {
    return await this.CategoryRepo.getCategorywithname(name);
  }
  async createCategory(
    name: string,
    description: string
  ): Promise<ICategory | void> {
    try {
      const data = await this.CategoryRepo.createCategory(name, description);
      if (data) {
        return data;
      }
    } catch (error) {
      new AppError(SystemError.DatabaseError, HttpStatusCode.BAD_REQUEST);
    }
  }
  async unaprovedgetCourses(page: number, typeofList: string) {
    let filter;
    if (typeofList != "all") {
      filter = { Approved_by_admin: typeofList };
    } else {
      filter = {};
    }
    const limit = 6;
    const skip = (page - 1) * limit;
    console.log(skip);

    return await this.CourseRepo.getUnaproved({ limit, skip }, filter);
  }
  async changeCategory(id: string, data: ICategory): Promise<void> {
    await this.CategoryRepo.editCategoy(id, data);
    return;
  }
  async actionCourse(id: string, type: boolean): Promise<void> {
    const courses = await this.CourseRepo.getCourseByCategory(id);
    courses.forEach(async (data) => {
      await this.CourseRepo.UpdataCourse(String(data._id), { unlist: type });
    });
    await this.CategoryRepo.action(id, type);
    return;
  }
}
export type IAdminUsecase = InstanceType<typeof Admin>;
