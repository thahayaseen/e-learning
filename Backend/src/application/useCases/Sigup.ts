import User from "../../domain/entities/UserSchema";
import IUserRepository from "../../domain/repositories/Users";
import { validateUser, UserType } from "../../infrastructure/validator/zod";
import Profile from "../../domain/entities/Profile";
import { userRepo } from "../../config/users";
import OTPService from "../../config/redis";
import { ZodError } from "zod";
import redis from "../../config/redis";
import Mail from "../../config/nodemailer";
import { randomUUID } from "crypto";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default class Signup {
  async create(users: User): Promise<any> {
    try {
      const newUser: UserType & { profile: Profile; gid: null } = {
        name: users.name,
        email: users.email,
        profile: users.profile,
        password: users.password,
        verified: false,
        role: "student",
        gid: null,
        purchasedCourses: [],
        subscription: null,
      };

      const validation = validateUser(newUser);
      const pass = await userRepo.hashpass(users.password);
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

        throw new AppError(errors || "Validation failed", 400);
      }

      console.log(`Checking if email exists: ${users.email}`);

      const existingUser = await userRepo.findByEmail(newUser.email);
      if (existingUser) {
        console.log("User already exists.");
        throw new AppError("User already exists.", 409);
      }

      let result = await redis.storedata(newUser);
      if (!result) {
        throw new AppError("Error while saving user to database.", 501);
      }

      if (result.uid) {
        console.log(`User created with ID: ${result.uid}`);

        const otp = await OTPService.exexute(result.uid);
        const body = userRepo.gethtmlotp(otp, newUser.name, newUser.email);
        const email = { to: newUser.email, subject: "OTP is", body: body };
        const mail = await Mail.sendMail(email);
        result = { ...result, ...{ message: mail } };
      }

      console.log("User created successfully:", result);
      return result;
    } catch (error: any) {
      console.error("Error in createUser:", error.message);

      if (error instanceof AppError) throw error;

      throw new AppError(
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }

  async reOtp(Id: string) {
    try {
      console.log(`Regenerating OTP for user ID: ${Id}`);
      const user = await OTPService.FindData(Id);
      if (!user) {
        throw new Error("User not Fount");
      }
      const otp = await OTPService.reOtp(Id);
      const body = userRepo.gethtmlotp(otp, user.name, user.email);
      const email = { to: user.email, subject: "OTP is", body: body };
      await Mail.sendMail(email);
      return { success: true, message: "otp set successfully" };
    } catch (error: any) {
      console.error("Error regenerating OTP:", error.message);
      throw new AppError(error.message, 500);
    }
  }

  async SavetoDb(userId: string) {
    try {
      const data = await redis.FindData(userId);

      if (!data) {
        throw new AppError("User Not Found", 404);
      }
      await redis.Udelete(userId);
      await redis.Otpdelete(userId);

      data.verified = true;
      await userRepo.create(data);
    } catch (error: any) {
      console.error("Error saving user to DB:", error.message);
      throw new AppError(
        error.message || "Failed to save user to database.",
        error.statusCode || 500
      );
    }
  }

  async verifyOtp(otp: string, Id: string) {
    try {
      console.log(`Verifying OTP for user ID: ${Id}`);
      const storedOtp = await OTPService.getotp(Id);
      if (!storedOtp) {
        throw new Error("Otp Expaied");
      }
      if (storedOtp !== otp) {
        console.log("OTP verification failed.");
        throw new AppError("Invalid OTP.", 400);
      }

      console.log("OTP verified successfully.");
      return true;
    } catch (error: any) {
      console.error("Error verifying OTP:", error.message);
      throw new AppError(error.message, 500);
    }
  }
  async glogin(user: any) {
    try {
      const useremail = await userRepo.findByEmail(user.email);
      const passwords = randomUUID();
      console.log(passwords);
      const pass = await userRepo.hashpass(passwords);
      console.log(user);
      if (!useremail) {
        await userRepo.create({
          name: user.name,
          email: user.email,
          Profile: { avatar: user.profile },
          password: pass,
          verified: true,
          role: "student",
          purchasedCourses: [],
          subscription: null,
        });

        return { success: true, password: passwords,role:'student' };
      }

      if (useremail.verified) {
        if (!useremail.gid) {
          await userRepo.updatagid(useremail._id, user.id);
          return { success: true, message: "varified success" };
        }

        if (useremail.gid === user.id) {
          return { success:true,role:useremail.role };
        }

        throw new AppError("Unauthorized in varifing", 500);
      } else {
        throw new AppError("Unauthorized", 500);
      }
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }
}
