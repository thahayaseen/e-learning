import IUserReposetory from "../../domain/repository/IUser.repository";
import { IAdmin } from "../../domain/interface/Iadmin";
import IRcategory from "../../domain/repository/Icategory.repository";
import { SystemError } from "./enum/systemError";
import { HttpStatusCode } from "./enum/Status";
import { ICategory } from "../../infra/database/models/Category";
import { ICoursesRepository } from "../../domain/repository/Icourses.repository";
import { FilterQuery } from "mongoose";
import { IUserModel } from "../../infra/database/models/User";
import { ICourses } from "../../infra/database/models/course";
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
  async getuserAdata({
    page,
    limit,
    search,
    filter,
  }: {
    page?: string;
    limit?: string;
    search?: string;
    filter?: {
    statusFilter?: string;
    rolefilter?: string;
  };
  }) {
    try {
      const skip = (Number(page) - 1) * Number(limit);
      let filters: FilterQuery<IUserModel> = {};
      if (search) {
        filters["$or"] = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (filter && Object.keys(filter).length > 0) {
        if (filter.statusFilter && filter.statusFilter !== "All") {
          filters["isBlocked"] =
            filter.statusFilter == "isBlocked" ? true : false;
        }
        if (
          filter &&
          Object.keys(filter).length > 0 &&
          filter.rolefilter !== "All"
        ) {
          filters["role"] = filter.rolefilter;
        }
      }
      const data = await this.UserRepository.findAlluser(
        Number(limit),
        Number(skip),
        filters
      );
      if (!data) {
        throw "not fount";
      }
      return data;
    } catch (error) {
      new AppError(error instanceof Error?error.message:'An error from get All users', 404);
    }
  }
  async Blockuser(id: string, type: boolean) {
    try {
      await this.UserRepository.Blockuser(id, type);
      return;
      return;
    } catch (error) {
      new AppError(error instanceof Error?error.message:'Error while block user form usecase', 404);
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
  async unaprovedgetCourses(page: number, typeofList: string, filters?: object) {
    let filter:FilterQuery<ICourses> = {};
    if (typeofList != "all") {
      filter = { Approved_by_admin: typeofList };
    } else if (filters) {
      filter["$or"] = [{ Title: { $regex: filters, $options: "i" } }];
    } else {
      filter = {};
    }
    console.log(filter);

    const limit = 6;
    const skip = (page - 1) * limit;

    return await this.CourseRepo.getUnaproved({ limit, skip }, filter);
  }
  async changeCategory(id: string, data: ICategory): Promise<void> {
    await this.CategoryRepo.editCategoy(id, data);
    return;
  }

  async actionCourse(
    id: string,
    type: boolean,
    Maction: boolean = false
  ): Promise<void> {
    const courses = await this.CourseRepo.getCourseByCategory(id);
    courses.forEach(async (data) => {
      await this.CourseRepo.UpdataCourse(String(data._id), { unlist: type });
    });
    await this.CategoryRepo.action(id, type);
    return;
  }
  async MainAcTion(id: string, action: boolean) {
    await this.CourseRepo.UpdataCourse(id, {
      Approved_by_admin: action ? "approved" : "rejected",
    });
  }
}
export type IAdminUsecase = InstanceType<typeof Admin>;
