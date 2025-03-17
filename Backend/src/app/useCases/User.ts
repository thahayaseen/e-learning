import { UserDTO } from "../dtos/Duser";
import IUserReposetory from "../../domain/repository/IUser";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import IRcategory from "../../domain/repository/IRcategory";
import { ICourses } from "../../infra/database/models/course";
import bcrypt from "bcrypt";
import { IUserModel } from "../../infra/database/models/User";

export class UserUsecase implements IuserUseCase {
  constructor(
    private userReposetory: IUserReposetory,
    private CourseRepo: ICoursesRepository
  ) {}
  async UseProfileByemail(email: string): Promise<UserDTO | null> {
    const data = await this.userReposetory.findByEmail(email);
    delete data?.password;
    return data;
  }
  async fetchAllUsers(
    query: any,mentorid?:string
  ): Promise<{ data: IUserModel[]; total: number }> {
    const {
      page,
      limit = 5,
      role,
      search,
      sort = "name",
      order = "asc",
    } = query;
    const filter: any = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (mentorid) {
      filter.purchasedCourses = {
        $in: await this.CourseRepo.getCourseBymentor(mentorid),
      };
    }
    console.log();
    

    const sortOptions = { [sort]: order === "asc" ? 1 : -1 };
    const users = await this.userReposetory.findAlluser(
      limit,
      0,
      filter,
      sortOptions,

    );
    console.log(users, "in form fetchibn");

    const userIds = users.formattedData.map((user) => user._id);

    const progressData = await this.CourseRepo.getUserProgress(userIds);
    return {
      data: users.formattedData.map((user) => ({
        ...user,
        progress: progressData.filter(
          (progress) => progress.Student_id.toString() === user._id.toString()
        ),
      })),
      total: users.totalpages,
    };
  }
}
