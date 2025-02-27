import { Request, Response, NextFunction } from "express";
// import {   userRepo } from "../../config/dependencies";
import {
  // signUpUser,
  LoginUsecase,
  adminUsecase,
} from "../../config/dependencies";
import { handleError } from "../../utils/handleerror";
// import redis from "../../config/redis";
import axios from "axios";
import { Roles, userError } from "../../app/useCases/enum/User";
// import jwt from "../../config/jwt";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { IsignUpUser } from "../../app/useCases/Signup";
export interface AuthServices extends Request {
  error?: string;
  user?: any;
}

export default class UserController {
  constructor(private signUpUser: IsignUpUser) {}
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);

      const data = await this.signUpUser.create(req.body);

      console.log("datais", data);
      res.cookie("varifyToken", data.token, {
        httpOnly: false,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        token: data.token,
        message: data.message,
      });
      return;
    } catch (error: any) {
      console.log("error in ", error);
      console.log("error code is ", error.statusCode);

      handleError(res, error, error.statusCode);
    }
  }

  async resendOtp(req: AuthServices, res: Response) {
    try {
      console.log(req.user, "user is doigshdfkilghdiuofhgd");

      const otp = await this.signUpUser.reOtp(req.user.userid);

      res.status(HttpStatusCode.OK).json(otp);
    } catch (error: any) {
      handleError(res, error, error.statusCode);
    }
  }

  async verifyed(req: AuthServices, res: Response) {
    try {
      console.log("idis", req.body.userid);

      await this.signUpUser.SavetoDb(req.body.userid);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log(req.body, "ingoo");
      const data = await LoginUsecase.logins(req.body.email, req.body.password);

      res.cookie("refresh", data.datas.refresh, {
        httpOnly: false,
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res
        .status(data?.success ? HttpStatusCode.OK : HttpStatusCode.UNAUTHORIZED)
        .json({
          success: data.success,
          message: data.message,
          access: data.datas.accses,
          user: data.user,
        });
      return;
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.token;
      console.log(token, "in token");

      const isValid = await this.signUpUser.verifyOtp(req.body.otp, token);
      console.log("the untoken", isValid);

      if (isValid) {
        req.body = { userid: isValid.userid };

        next();
      }
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async verifyForgotpassword(req: Request, res: Response) {
    try {
      if (req.body.userid) {
        console.log("here", req.body.userid);

        const tocken = await LoginUsecase.forgotTocken(req.body.userid);

        res.status(HttpStatusCode.OK).json({ success: true, tocken: tocken });
      }
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async forgotPassOtpsent(req: Request, res: Response) {
    try {
      const token = await LoginUsecase.forgetpass(req.body.email);
      res.status(HttpStatusCode.OK).json({ success: true, token });
    } catch (error: any) {
      console.log(error);
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async changepass(req: AuthServices, res: Response) {
    console.log("usersss", req.user);

    if (!req.user) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: userError.UserNotFound });
      return;
    }
    console.log("sdfasfasedgfasdthfiduw", req.body, req.user);
    if (!req.user.userid || !req.body.password) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "please check all feiled" });
      return;
    }
    await LoginUsecase.changepassword(req.user.userid, req.body.password);
    console.log(req.user, "returning");

    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "password changed" });
    return;
  }
  async reduxvarify(req: AuthServices, res: Response) {
    if (req.body.accessTocken) {
      console.log("yse");

      res.cookie("access", req.body.accessTocken, {
        httpOnly: false,
        expires: new Date(Date.now() + 15 * 60 * 1000) // Expires in 15 minutes
      });
    }
    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "varified success", user: req.user });
    return;
  }
  async glogin(req: AuthServices, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token, "now nwo;");

      if (!token) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ success: false, message: "No token provided" });
        return;
      }

      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData: any = response.data;
      console.log("userdata is ", userData);

      const datas = await this.signUpUser.glogin(userData);
      console.log(datas, "is dasdgfsdfta");

      res.cookie("refresh", datas.token.refresh, {
        httpOnly: false,
        expires: new Date(Date.now() + 7 *60* 60 * 1000) // Expires in 15 minutes
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "google login success",
        token: datas.token?.accses,
        user: datas.user,
      });
      return;
    } catch (error) {
      console.error("Error in glogin:", error);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
  logout(req: Request, res: Response) {
    res.clearCookie("refresh", { path: "/" });
    console.log(req.cookies);
    console.log("deleted");

    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "Session cleared, refresh token kept." });
  }
  async userData(req: AuthServices, res: Response) {
    try {
      const { role } = req.user;
      console.log(role, "in  usedatass");

      if (!role || role !== Roles.ADMIN) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ success: true, message: "Unauthorized" });
        return;
      }
      const { page, limit } = req.query;
      if (!page || !limit) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ success: false, message: "credential error" });
        return;
      }
      if (typeof page == "string" && typeof limit == "string") {
        const datas = await adminUsecase.getuserAdata({ page, limit });

        console.log(datas, "fasasdg");

        res.status(HttpStatusCode.OK).json({
          success: true,
          message: "data fetched success",
          data: datas,
        });
      }
    } catch (error: any) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ success: false, message: error.message });
    }
  }
  // user profile and datas 
  // async userProfile(){
  //   this.signUpUser.
  // }
}

