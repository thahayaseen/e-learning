import { userRepo } from "../../config/users";
import jwtokens from "../../config/jwt";
import redis from "../../config/redis";
import nodemailer from "../../config/nodemailer";
import { userCases } from "../../config/users";
class AppError extends Error {
  constructor(message: string, private statuscode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export default class Login {
  async logins(email: string, password: string) {
    try {
      console.log(email);

      const data = await userRepo.findByEmail(email);
      console.log(data);

      if (!data) {
        throw new AppError("User not Fount", 404);
      }
      const isvalid = await userRepo.Hmatch(password, data.password);
      console.log(password, isvalid);

      if (!isvalid) {
        throw new AppError("incotect password", 404);
      }
      const token = await jwtokens.generateToken({
        roll:data.role,
        name: data.name,
        email: data.email,
      });
      
      console.log(token.accses);
    
      return { success: true, message: "varified ",user:{name:data.name,email:data.email,roll:data.role}, datas: token };
    } catch (error: any) {
      console.log(error);
      throw new AppError(error.message, error.statusCode);
    }
  }
  async forgetpass(email: string) {
    try {
      const data = await userRepo.findByEmail(email);
      if (!data || !data._id) {
        throw new AppError("User Not found", 404);
      }
      const otp = await redis.exexute(data._id as string);
      const body = userRepo.gethtmlotp(otp, data.name, email);
      nodemailer.sendMail({ to: email, subject: "forget pass", body });

      return { userid: data._id };
    } catch (error: any) {
      console.log(error.message, "in controller");
      throw new AppError(error.message, 404);
    }
  }
  async changepassword(userid: string, password: string) {
    try {
      console.log("userid and pass in login", userid, password);

     await  userRepo.changepass(userid, password);
      return 
    } catch (error:any) {
      throw new Error(error.message)
    }
  }
}
