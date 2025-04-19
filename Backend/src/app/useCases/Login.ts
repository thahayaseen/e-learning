import { JwtPayload } from "jsonwebtoken";
import {
  mailServices,
  redisUseCases,
  // jwtTockenProvider,
} from "../../config/dependencies";
import { userError } from "./enum/User";
import IUserReposetory from "../../domain/repository/IUser.repository";
import { ILogin } from "../../domain/interface/Ilogin";
import { IJwtService } from "../../domain/Provider/Ijwt";

class AppError extends Error {
  constructor(message: string, private statuscode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default class Login implements ILogin {
  constructor(
    private userRepository: IUserReposetory,
    private jwtTockenProvider: IJwtService
  ) {}
  async logins(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    user: { name: string; email: string; role: string };
    datas: string;
  }> {
    try {
      console.log(email);

      const data = await this.userRepository.findByEmail(email);
      console.log(data);

      if (!data || !data.password || !data.role) {
        throw new AppError("User not Fount", 404);
      }

      const isvalid = await this.userRepository.Hmatch(password, data.password);
      console.log(password, isvalid);

      if (!isvalid) {
        throw new AppError("incotect password", 404);
      }
      if(data.isBlocked){
        throw new AppError('User is Blocked',401)
      }
      const token = await this.jwtTockenProvider.exicute({
        role: data.role,
        name: data.name,
        email: data.email,
      });

      return {
        success: true,
        message: "varified ",
        user: { name: data.name, email: data.email, role: data.role },
        datas: JSON.stringify(token),
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
      const token = await this.jwtTockenProvider.accsessToken({
        userid: data._id,
      });
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
    return await this.jwtTockenProvider.accsessToken({ userid });
  }
  async changepassword(userid: string, password: string) {
    try {
      console.log("userid and pass in login", userid, password);

      await this.userRepository.changepass(userid, password);
      console.log("done");

      return;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async protectByjwt(tocken: string): Promise<JwtPayload | null> {
    try {
      return this.jwtTockenProvider.verifyToken(tocken);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async generatToken(data: JwtPayload) {
    return this.jwtTockenProvider.accsessToken(data);
  }
  async findUserwithemail(email: string) {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      throw new Error('UserNotFound')
    }
  }
}
export type IloginUsecase = InstanceType<typeof Login>;
