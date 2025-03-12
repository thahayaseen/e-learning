import { UserDTO } from "../dtos/Duser";
import IUserReposetory from "../../domain/repository/IUser";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import IRcategory from "../../domain/repository/IRcategory";
import { ICourses } from "../../infra/database/models/course";
import bcrypt from "bcrypt";

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
 
}
