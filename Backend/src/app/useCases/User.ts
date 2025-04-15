import { UserDTO } from "../dtos/Duser";
import IUserReposetory from "../../domain/repository/IUser";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import IRcategory from "../../domain/repository/IRcategory";
import { ICourses } from "../../infra/database/models/course";
import bcrypt from "bcrypt";
import { IUserModel } from "../../infra/database/models/User";
import { ImentorRequestRepo } from "../../domain/repository/ImentroRequstrepository";
import {
  alldata,
  Imentorrequst,
} from "../../infra/repositories/beaMentorRepositroy";
import { Roles } from "./enum/User";
import { Types } from "mongoose";

export class UserUsecase implements IuserUseCase {
  constructor(
    private userReposetory: IUserReposetory,
    private CourseRepo: ICoursesRepository,
    private MRequestRepo: ImentorRequestRepo
  ) {}
  async UseProfileByemail(email: string): Promise<UserDTO | null> {
    const data = await this.userReposetory.findByEmail(email);
    delete data?.password;
    return data;
  }
  async fetchAllUsers(
    query: any,
    mentorid?: string
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
        $in: (await this.CourseRepo.getCourseBymentor(mentorid)).map(
          (data: any) => new Types.ObjectId(data?._id as string)
        ),
      };
    }
    // if (mentorid) {
    //   const courseData = await this.CourseRepo.getCourseBymentor(mentorid);
    //   if (courseData) {
    //     filter.purchasedCourses = {
    //       $in: courseData.Mentor_id,
    //     };
    //   }
    // }
    console.log(mentorid, "mentoridis",filter);

    const sortOptions = { [sort]: order === "asc" ? 1 : -1 };
    const users = await this.userReposetory.findAlluser(
      limit,
      0,
      filter,
      sortOptions
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
  async requstbeMentor(
    userid: string,
    data: Omit<Imentorrequst, "userid">
  ): Promise<void> {
    return await this.MRequestRepo.addrequest(userid, data);
  }
  async getAllrequst(page: number, filter: any = {}): Promise<alldata> {
    return await this.MRequestRepo.getallReqeust(page, filter);
  }
  async updateRequst(dataid: string, action: string): Promise<Imentorrequst> {
    const data = await this.MRequestRepo.acction(dataid, action);
    if (!data) {
      throw new Error("Cannot update Requst");
    }
    return data;
  }
  async getuserMentorRequst(userid: string): Promise<Imentorrequst | null> {
    return await this.MRequestRepo.getRequstByuserid(userid);
  }
  async updateUserdata(userid: string, data: any): Promise<void> {
    return await this.userReposetory.changeUserdata(userid, data);
  }
  async changePawword(
    userid: string,
    oldPass: string,
    newPassword: string
  ): Promise<void> {
    try {
      const userdata = await this.userReposetory.findByid(userid);
      if (!userdata || !userdata.password) {
        throw new Error("user Not found");
      }
      const ismatch = await this.userReposetory.Hmatch(
        oldPass,
        userdata.password
      );
      console.log(ismatch);
      if (!ismatch) {
        throw new Error("inccorect password");
      }
      await this.userReposetory.changepass(userid, newPassword);
      return;
    } catch (error: any) {
      throw new Error(error.message || "Unable to cahnge the password");
    }
  }
  async AllOrders(
    userId: string,
    page: number,
    limit: number,
    filter: object = {}
  ): Promise<any> {
    console.log(userId, page, limit, "in usecases");
    if (userId == "all") {
      console.log("in all admin cases");

      return await this.CourseRepo.getAllordersAdmin(page, limit, filter);
    }
    return await this.userReposetory.getAllorders(userId, page, limit);
  }
  async changeUserRoleUsecase(
    userid: string,
    role: "mentor" | "admin" | "user"
  ): Promise<void> {
    await this.userReposetory.changeUserRole(userid, role);
    return;
  }

  async ChackuseraldredyBuyed(
    userid: string,
    courseid: string,
    status: boolean
  ): Promise<null> {
    const data = await this.CourseRepo.getorderByuidandCourse(
      userid,
      courseid,
      status
    );
    if (data) {
      throw new Error("Aldredy Purchased");
    }
    return data;
  }
}
