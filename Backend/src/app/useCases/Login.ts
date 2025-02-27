import { JwtPayload } from "jsonwebtoken";
import {
  userRepository,
  mailServices,
  redisUseCases,
  jwtTockenProvider,
} from "../../config/dependencies";
import { userError } from "./enum/User";
import IUserReposetory from "../repository/IUser";
// import jwtokens from "../../config/jwt";
// import redis from "../../config/redis";
// import nodemailer from "../../config/nodemailer";
// import { userCases } from "../../config/users";
class AppError extends Error {
  constructor(message: string, private statuscode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export default class Login {
  constructor(private userRepository:IUserReposetory){}
  async logins(email: string, password: string) {
    try {
      console.log(email);

      const data = await this.userRepository.findByEmail(email);
      console.log(data);

      if (!data||!data.password) {
        throw new AppError("User not Fount", 404);
      }
      const isvalid = await this.userRepository.Hmatch(password, data.password);
      console.log(password, isvalid);

      if (!isvalid) {
        throw new AppError("incotect password", 404);
      }
      const token = await jwtTockenProvider.exicute({
        role: data.role,
        name: data.name,
        email: data.email,
      });

      return {
        success: true,
        message: "varified ",
        user: { name: data.name, email: data.email, role: data.role },
        datas: token,
      };
    } catch (error: any) {
      console.log(error);
      throw new AppError(error.message, error.statusCode);
    }
  }
  async forgetpass(email: string) {
    try {
      const data = await this.userRepository.findByEmail(email);
      if (!data || !data._id) {
        throw new AppError(userError.UserNotFound, 404);
      }
      const otp = await redisUseCases.exexute(data._id as string);
      const token=await jwtTockenProvider.accsessToken({userid:data._id})
      await mailServices.otpsent({
        useEmail: data.email,
        name: data.name,
        otp,
      });
      return { token };
    } catch (error: any) {
      console.log(error.message, "in controller");
      throw new AppError(error.message, 404);
    }
  }
  async forgotTocken(userid: string) {
    return await jwtTockenProvider.accsessToken({ userid });
  }
  async changepassword(userid: string, password: string) {
    try {
      console.log("userid and pass in login", userid, password);

      await this.userRepository.changepass(userid, password);
      console.log('done');
      
      return;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async protectByjwt(tocken:string){
    try {
      return await jwtTockenProvider.verifyToken(tocken)
    } catch (error:any) {
      throw new Error(error.message)
    }
  }
  async generatToken(data:JwtPayload){
    return jwtTockenProvider.accsessToken(data)
  }
}
export type IloginUsecase = InstanceType<typeof Login>;
