import { Request, Response, NextFunction } from "express";
// import {   userRepo } from "../../config/dependencies";
import {
  signUpUser,
  LoginUsecase,
  adminUsecase,
} from "../../config/dependencies";
import { handleError } from "../../utils/handleerror";
// import redis from "../../config/redis";
import axios from "axios";
import { Roles, userError } from "../../domain/enum/User";
// import jwt from "../../config/jwt";
export interface AuthServices extends Request {
  error?: string;
  user?: any;
}

export default class UserController {
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);

      const data = await signUpUser.create(req.body);

      console.log("datais", data);

      res.status(200).json({
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
      const otp = await signUpUser.reOtp(req.body.userid);

      res.status(200).json(otp);
    } catch (error: any) {
      handleError(res, error, error.statusCode);
    }
  }

  async verifyed(req: AuthServices, res: Response) {
    try {
      console.log("idis", req.body.userid);

      await signUpUser.SavetoDb(req.body.userid);

      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error, 401);
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log(req.body, "ingoo");
      const data = await LoginUsecase.logins(req.body.email, req.body.password);

      res.cookie("refresh", data.datas.refresh, { httpOnly: true });
      res.status(data?.success ? 200 : 401).json({
        success: data.success,
        message: data.message,
        access: data.datas.accses,
        user: data.user,
      });
      return;
    } catch (error) {
      handleError(res, error, 401);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.token;
      console.log(token, "in token");

      const isValid = await signUpUser.verifyOtp(req.body.otp, token);
      console.log("the untoken", isValid);

      if (isValid) {
        req.body = { userid: isValid.userid };

        next();
      }
    } catch (error) {
      handleError(res, error, 401);
    }
  }
  async verifyForgotpassword(req: Request, res: Response) {
    try {
      if (req.body.userid) {
        console.log("here", req.body.userid);

        const tocken = await LoginUsecase.forgotTocken(req.body.userid);

        res.status(200).json({ success: true, tocken: tocken });
      }
    } catch (error) {
      handleError(res, error, 401);
    }
  }

  async forgotPassOtpsent(req: Request, res: Response) {
    try {
      const token = await LoginUsecase.forgetpass(req.body.email);
      res.status(200).json({ success: true, token });
    } catch (error) {
      console.log(error);
      handleError(res, error, 401);
    }
  }

  async changepass(req: AuthServices, res: Response) {
    console.log("usersss", req.user);

    if (!req.user) {
      res.status(401).json({ success: false, message: userError.UserNotFound });
      return;
    }
    console.log("sdfasfasedgfasdthfiduw", req.body, req.user);
    if (!req.user.userid || !req.body.password) {
      res.status(401).json({ message: "please check all feiled" });
      return;
    }
    await LoginUsecase.changepassword(req.user.userid, req.body.password);
    console.log(req.user, "returning");

    res.status(200).json({ success: true, message: "password changed" });
    return;
  }
  async reduxvarify(req: AuthServices, res: Response) {
    if (req.body.accessTocken) {
      console.log("yse");

      res.cookie("access",req.body.accessTocken, {httpOnly: true});
    }
    res
      .status(200)
      .json({ success: true, message: "varified success", user: req.user });
    return;
  }
  async glogin(req: AuthServices, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token, "now nwo;");

      if (!token) {
        res.status(401).json({ success: false, message: "No token provided" });
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

      const datas = await signUpUser.glogin(userData);
      console.log(datas, "is dasdgfsdfta");

      res.cookie("refresh", datas.token.refresh, { httpOnly: true });

      res.status(200).json({
        success: true,
        message: "google login success",
        token: datas.token?.accses,
        user: datas.user,
      });
      return;
    } catch (error) {
      console.error("Error in glogin:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
  logout(req: Request, res: Response) {
    res.clearCookie("refresh", { path: "/" });
    console.log(req.cookies);
    console.log("deleted");

    res
      .status(200)
      .json({ success: true, message: "Session cleared, refresh token kept." });
  }
  async userData(req: AuthServices, res: Response) {
    try {
      const { role } = req.user;
      console.log(role, "in  usedatass");

      if (!role || role !== Roles.ADMIN) {
        res.status(401).json({ success: true, message: "Unauthorized" });
        return;
      }
      const { page, limit } = req.query;
      if (!page || !limit) {
        res.status(401).json({ success: false, message: "credential error" });
        return;
      }
      if (typeof page == "string" && typeof limit == "string") {
        const datas = await adminUsecase.getuserAdata({ page, limit });

        console.log(datas, "fasasdg");

        res
          .status(200)
          .json({
            success: true,
            message: "data fetched success",
            data: datas,
          });
      }
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
