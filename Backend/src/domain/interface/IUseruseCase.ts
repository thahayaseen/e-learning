import { UserDTO } from "../../app/dtos/Duser";
import { ICourses } from "../../infra/database/models/course";
import { IUserModel } from "../../infra/database/models/User";

export interface IuserUseCase {
  UseProfileByemail(email: string): Promise<UserDTO | null>;
  fetchAllUsers(query: any,mentorid?:string): Promise<{data:IUserModel[],total:number}>;
}
