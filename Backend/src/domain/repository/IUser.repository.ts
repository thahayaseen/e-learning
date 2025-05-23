import User from "../entities/UserSchema";
import { IUserModel } from "../../infra/database/models/User";
import AdminUserDTO from "../../app/dtos/adminDTOUsers";
import { UserDTO } from "../../app/dtos/Duser";
import { Roles } from "../../app/useCases/enum/User";
export interface Alluserinterface {
  formattedData: any[];
  totalpages: number;
}
export default interface IUserReposetory {
  findByid(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  create(users: UserDTO): Promise<UserDTO | null>;
  updateName(name: string, id: string): Promise<UserDTO | null>;
  changepass(id: string, password: string): Promise<void | null>;
  verify(id: string): Promise<void | null>;
  hashpass(pass: string): Promise<string>;
  Hmatch(Upass: string, Hpass: string): Promise<boolean>;
  findAlluser(
    limit: number,
    skip: number,
    filter?: any,
    sortOptions?: any,
    mentorid?: string
  ): Promise<Alluserinterface>;
  // finduserBymentor(mentorid:string,skip:number,limit:number):Promise<UserDTO[]>
  Blockuser(id: string, type: boolean): Promise<void>;
  updatagid(id: string, git: string): Promise<UserDTO | null>;
  addCourseInstudent(userId: string, courseId: string): Promise<void>;
  changeUserdata(userid: string, data: any): Promise<void>;
  getAllorders(userId: string, page: number, limit: number): Promise<any[]>;
  changeUserRole(userid: string, role: 'mentor'|'admin'|'user'): Promise<void>;
}
