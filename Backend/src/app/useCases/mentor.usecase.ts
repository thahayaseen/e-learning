import IUserReposetory from "../../domain/repository/IUser.repository";
import IRcategory from "../../domain/repository/Icategory.repository";
import { ICoursesRepository } from "../../domain/repository/Icourses.repository";
import { ICategory } from "../../infra/database/models/Category";
import { ICourses } from "../../infra/database/models/course";
import { Task } from "../../infra/database/models/tasks";
import { Ioption } from "../dtos/categoryDTO";
import { CourseDTO } from "../dtos/coursesDto";

export class MentorUsecase {
  constructor(
    private userRepo: IUserReposetory,
    private CategoryRepo: IRcategory,
    private CoursRepositry: ICoursesRepository
  ) {}

  async getallCategory(options: Ioption = {}) {
    return await this.CategoryRepo.getAllCategory(options);
  }

  async findUserid(email: string) {
    return await this.userRepo.findByEmail(email);
  }

  async getState(mentorid: string): Promise<any> {
    return await this.CoursRepositry.getOrderStats(mentorid);
  }
  async getRevenueData(mentorid: string): Promise<any> {
    return await this.CoursRepositry.getRevenueData(mentorid);
  }
}
