import User from "../../domain/entities/UserSchema";
import { validateUser, UserType } from "../../infra/validator/zod";
import Profile from "../../domain/entities/Profile";
import {
  userRepository,
  mailServices,
  redisUseCases,
  jwtTockenProvider,
} from "../../config/dependencies";
import { v4 as uuid } from "uuid";
import { SystemError } from "./enum/systemError";
import { userError,EOtp } from "./enum/User";
import Otp from "../../domain/entities/otp";
import RedisAndOtpUsecases from "../adapters/RedisAdapter";
import { userCreateDTO } from "../dtos/Duser";
import { HttpStatusCode } from "./enum/Status";

// import redis from "../../config/redis";

// import { ZodError } from "zod";
// import Mail from "../../config/nodemailer";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default class Signup {
  async create(users: User): Promise<userCreateDTO> {
    try {
      const uid = uuid();
      const newUser: UserType & {
        profile: Profile;
        gid: null;
        isblocked: boolean;
      } = {
        name: users.name,
        email: users.email,
        profile: users.profile,
        password: users.password,
        verified: false,
        role: "student",
        gid: null,
        isblocked: false,
        purchasedCourses: [],
        subscription: null,
      };

      const validation = validateUser(newUser);
      const pass = await userRepository.hashpass(users.password);
      newUser.password = pass;
      console.log("users", newUser);

      if (!validation.success) {
        const valerro = validation.error.format();
        console.error("Validation Errors:", valerro);

        let errors = "";

        Object.entries(valerro).forEach(([key, value]) => {
          if (Array.isArray(value)) {
          } else if (value && "_errors" in value) {
            errors += value._errors + "\n";
          }
        });

        console.log(errors, "error is ");

        throw new AppError(errors || "Validation failed", HttpStatusCode.BAD_REQUEST);
      }

      console.log(`Checking if email exists: ${users.email}`);

      await this.aldredyExsist(users.email);

      let result = await redisUseCases.storeUser(uid, newUser, 900); //1800 time saved user data
      if (!result) {
        throw new AppError(SystemError.DatabaseError, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      console.log(`User created with ID: ${uid}`);
      const token = await jwtTockenProvider.accsessToken({ userid: uid });
      if (!token) {
        throw new AppError(SystemError.SystemError, HttpStatusCode.INTERNAL_SERVER_ERROR);
      }
      const otp = await redisUseCases.exexute(uid);
      await mailServices.otpsent({
        useEmail: newUser.email,
        name: newUser.name,
        otp: otp,
      });

      console.log("User created successfully:", result);

      return { token, message: "otp sent successfully" };
    } catch (error: any) {
      console.error("Error in createUser:", error.message);

      if (error instanceof AppError) throw error;

      throw new AppError(
        error.message || "Internal Server Error",
        error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async aldredyExsist(email: string) {
    try {
      const data = await userRepository.findByEmail(email);
      if (data) {
        throw new AppError(userError.UseralreadyExisit,HttpStatusCode.BAD_REQUEST);
      }
    } catch (error:any) {
      throw new AppError(error.message, error.statusCode||HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
  async reOtp(Id: string) {
    try {
      console.log(`Regenerating OTP for user ID: ${Id}`);
      const user = await redisUseCases.FindData(`${Id}`)||await userRepository.findByid(Id)
      // const mongodata=await userRepository.findByid(Id)
      if (!user) {
        throw new AppError(userError.UserNotFound,HttpStatusCode.NOT_FOUND);
      }
      console.log('user in resend is ',user);
      
      const otp = await redisUseCases.reOtp(Id);
    
      user.email;
      await mailServices.otpsent({
        useEmail: user.email,
        name: user.name,
        otp,
      });

      return { success: true, message: "otp set successfully" };
    } catch (error: any) {
      console.error("Error regenerating OTP:", error.message);
      throw new AppError(error.message, error.statusCode);
    }
  }

  async SavetoDb(userId: string) {
    try {
      const data = await redisUseCases.FindData(userId);

      if (!data) {
        throw new AppError(userError.UserNotFound, HttpStatusCode.NOT_FOUND);
      }
      await redisUseCases.Udelete(userId);
      await redisUseCases.Otpdelete(userId);

      data.verified = true;
      await userRepository.create(data);
    } catch (error: any) {
      console.error("Error saving user to DB:", error.message);
      throw new AppError(
        error.message || "Failed to save user to database.",
        error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyOtp(otp: string, Id: string) {
    try {
      console.log(`Verifying OTP for user ID: ${Id}`);
      const token = jwtTockenProvider.verifyToken(Id);
      console.log(token);
      
      if (!token) {
        throw Error(userError.Unauthorised);
      }
      const storedOtp = await redisUseCases.getotp(token.userid);
      if (!storedOtp) {
        throw new AppError(EOtp.OtpExpired,HttpStatusCode.NOT_FOUND);
      }
      if (storedOtp !== otp) {
        console.log("OTP verification failed.");
        throw new AppError(EOtp.InvalidOtp, 400);
      }

      console.log("OTP verified successfully.");
      return token;
    } catch (error: any) {
      console.error("Error verifying OTP:", error.message);
      throw new AppError(error.message, error.statusCode);
    }
  }
  async glogin(user: any) {
    try {
      console.log(user,"in datas");
      
      const useremail = await userRepository.findByEmail(user.email);
      user.role=useremail?.role||'student'
      const token = await jwtTockenProvider.exicute({
        name: user.name,
        email: user.email,
        role: useremail?.role||'student',
      });
      if (!useremail) {
        const passwords = uuid();
        const pass = await userRepository.hashpass(passwords);

        await userRepository.create({
          name: user.name,
          email: user.email,
          Profile: { avatar: user.profile },
          password: pass,
          verified: true,
          role: "student",
          purchasedCourses: [],
          subscription: null,
        });

        return { success: true, message: "User created successfully", token };
      }

      if (!useremail.verified) throw new AppError(userError.Unauthorised, HttpStatusCode.UNAUTHORIZED);
      if (!useremail.gid) {
        await userRepository.updatagid(useremail._id, user.id);
        return { success: true, message: "Verified successfully", user:{name:user.name,email:user.email,role:user.role},token };
      }
      if (useremail.gid !== user.id)
        throw new AppError(userError.Unauthorised, HttpStatusCode.UNAUTHORIZED);

      return { success: true, user:{name:user.name,email:user.email,role:user.role},token };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode||HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
export type IsignUpUser = InstanceType<typeof Signup>;
