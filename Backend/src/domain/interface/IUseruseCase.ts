import { UserDTO } from "../../app/dtos/Duser";
import { Roles } from "../../app/useCases/enum/User";
import { ICourses } from "../../infra/database/models/course";
import { IUserModel } from "../../infra/database/models/User";
import {
  alldata,
  Imentorrequst,
} from "../../infra/repositories/beaMentorRepositroy";

export interface IuserUseCase {
  UseProfileByemail(email: string): Promise<UserDTO | null>;
  fetchAllUsers(
    query: any,
    mentorid?: string
  ): Promise<{ data: IUserModel[]; total: number }>;
  requstbeMentor(
    userid: string,
    data: Omit<Imentorrequst, "userid">
  ): Promise<void>;
  getAllrequst(page: number, filter: any): Promise<alldata>;
  updateRequst(dataid: string, action: string): Promise<Imentorrequst>;
  getuserMentorRequst(userid: string): Promise<Imentorrequst | null>;
  updateUserdata(userid: string, data: any): Promise<void>;
  changePawword(
    userid: string,
    oldPass: string,
    newPassword: string
  ): Promise<void>;
  AllOrders(
    userId: string,
    page: number,
    limit: number,
    filter?: object
  ): Promise<any>;
  changeUserRoleUsecase(
    userid: string,
    role: "mentor" | "admin" | "user"
  ): Promise<void>;
  ChackuseraldredyBuyed(
    userid: string,
    courseid: string,
    status: boolean
  ): Promise<null>;
}
