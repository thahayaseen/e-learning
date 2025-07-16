import User from "../../domain/entities/UserSchema";
import { validateUser, UserType } from "../../infra/validator/zod";
import Profile from "../../domain/entities/Profile";
import { mailServices, redisUseCases } from "../../config/dependencies";
import { v4 as uuid } from "uuid";
import { SystemError } from "./enum/systemError";
import { userError, EOtp, Roles } from "./enum/User";

import { GoogleLoginDTO, userCreateDTO } from "../dtos/Duser";
import { HttpStatusCode } from "./enum/Status";
import IUserReposetory from "../../domain/repository/IUser.repository";

import { IJwtService } from "../../domain/Provider/Ijwt";
import { HandleErrointerface } from "../../utils/handleerror";

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
  constructor(
    private userRepository: IUserReposetory,
    private jwtTockenProvider: IJwtService
  ) // private uid = uuid()
  {}
  uniqueusername(name: string) {
    const uuids = uuid();
    return name.split(" ").join("").toLowerCase() + uuids.slice(0, 6);
  }
  async create(users: User): Promise<userCreateDTO> {
    const uid = uuid();
    try {
      const newUser: UserType & {
        profile: Profile;
        gid: null;
        isBlocked: boolean;
        username: string;
      } = {
        name: users.name,
        username: this.uniqueusername(users.name),
        email: users.email,
        profile: users.profile,
        password: users.password,
        verified: false,
        role: "student",
        gid: null,
        isBlocked: false,
        purchasedCourses: [],
        subscription: null,
      };

      const validation = validateUser(newUser);
      const pass = await this.userRepository.hashpass(users.password);
      newUser.password = pass;
 

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

 

        throw new AppError(
          errors || "Validation failed",
          HttpStatusCode.BAD_REQUEST
        );
      }

 

      await this.aldredyExsist(users.email);

      let result = await redisUseCases.storeUser(uid, newUser, 900); //1800 time saved user data
      if (!result) {
        throw new AppError(
          SystemError.DatabaseError,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }

 
      const token = await this.jwtTockenProvider.accsessToken({
        userid: uid,
      });
      if (!token) {
        throw new AppError(
          SystemError.SystemError,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }
      const otp = await redisUseCases.exexute(uid);
      await mailServices.otpsent({
        useEmail: newUser.email,
        name: newUser.name,
        otp: otp,
      });

 

      return { token, message: "otp sent successfully" };
    } catch (error) {


      if (error instanceof AppError) throw error;

      throw new AppError(
        error instanceof Error ?error.message: "Internal Server Error",
         (error as HandleErrointerface).statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async aldredyExsist(email: string) {
    try {
      const data = await this.userRepository.findByEmail(email);
      if (data) {
        throw new AppError(
          userError.UseralreadyExisit,
          HttpStatusCode.BAD_REQUEST
        );
      }
    } catch (error) {
      throw new AppError(
        error instanceof Error?error.message:'error while chekd user aldredy exsist',
         (error as HandleErrointerface).statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async reOtp(Id: string) {
    try {
 
      const user =
        (await redisUseCases.FindData(`${Id}`)) ||
        (await this.userRepository.findByid(Id));
      // const mongodata=await this.userRepository.findByid(Id)
      if (!user) {
        throw new AppError(userError.UserNotFound, HttpStatusCode.NOT_FOUND);
      }
 

      const otp = await redisUseCases.reOtp(Id);

      user.email;
      await mailServices.otpsent({
        useEmail: user.email,
        name: user.name,
        otp,
      });

      return { success: true, message: "otp set successfully" };
    } catch (error) {
      // console.error("Error regenerating OTP:", error.message);
      throw new AppError(error instanceof Error?error.message:'Error while resent otp',  (error as HandleErrointerface).statusCode);
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
      await this.userRepository.create(data);
    } catch (error) {
      // console.error("Error saving user to DB:", error.message);
      throw new AppError(
      error instanceof Error?  error.message: "Failed to save user to database.",
         (error as HandleErrointerface).statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyOtp(otp: string, Id: string) {
    try {
 
      const token = this.jwtTockenProvider.verifyToken(Id);
 

      if (!token) {
        throw Error(userError.Unauthorised);
      }
      const storedOtp = await redisUseCases.getotp(token.userid);
      if (!storedOtp) {
        throw new AppError(EOtp.OtpExpired, HttpStatusCode.NOT_FOUND);
      }
      if (storedOtp !== otp) {
 
        throw new AppError(EOtp.InvalidOtp, 400);
      }

 
      return token;
    } catch (error) {
      // console.error("Error verifying OTP:", error.message);
      throw new AppError(error instanceof Error?error.message:'error while varify otp',  (error as HandleErrointerface).statusCode);
    }
  }
  async glogin(user: GoogleLoginDTO) {
    try {
 
      const myprofile = { avatar: user.picture };
 

      const useremail = await this.userRepository.findByEmail(user.email);
 
      
      if (useremail?.isBlocked) {
        throw new Error("user has been blocked");
        // return {success:false,message:'user has been blocked'}
      }
      user.role = useremail?.role || "student";
      const token = await this.jwtTockenProvider.exicute({
        name: user.name,
        email: user.email,
        role: useremail?.role || "student",
      });
      if (!useremail) {
        const passwords = uuid();
        const pass = await this.userRepository.hashpass(passwords);
        const adta = await this.userRepository.create({
          name: user.name,
          email: user.email,
          username: this.uniqueusername(user.name),
          profile: myprofile,
          password: pass,
          verified: true,
          role: "student",
          purchasedCourses: [],
          subscription: null,
        });
 

        return { success: true, message: "User created successfully", token };
      }

      if (!useremail.verified)
        throw new AppError(userError.Unauthorised, HttpStatusCode.UNAUTHORIZED);
      if (!useremail.gid) {
        await this.userRepository.updatagid(useremail._id as string, user.id);
        return {
          success: true,
          message: "Verified successfully",
          user: { name: user.name, email: user.email, role: user.role },
          token,
        };
      }
      if (useremail.gid !== user.id)
        throw new AppError(userError.Unauthorised, HttpStatusCode.UNAUTHORIZED);

      return {
        success: true,
        user: { name: user.name, email: user.email, role: user.role },
        token,
      };
    } catch (error: any) {
      throw new AppError(
        error.message,
        error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export type IsignUpUser = InstanceType<typeof Signup>;
