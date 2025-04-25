import { NextFunction, Request, Response } from "express";
import { Roles } from "../../app/useCases/enum/User";
import { HttpStatusCode } from "../../app/useCases/enum/Status";

import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import { AuthServices } from "../controller/user.controller";

import { IloginUsecase } from "../../app/useCases/Login.usecase";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";

export class AllMiddleware {
  constructor(
    private LoginUsecase: IloginUsecase,
    private userUseCase: IuserUseCase,
    private CourseUsecase: CourseUsecase
  ) {}
  // 👇 Middleware factory function
  roleChecker(requiredRole: Roles) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role } = (req as any).user; // Adjust typing if needed

 
 

        if (!role || role !== requiredRole) {
          throw new Error("Don't have access");
        }

        next();
      } catch (error) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "You don't have access to this api",
        });
      }
    };
  }

  jwtVerify = async (req: AuthServices, res: Response, next: NextFunction) => {
    try {
 
      let token = req.headers.authorization?.split(" ")[1];
      let userData = null;

      if (token) {
        userData = await this.LoginUsecase.protectByjwt(token);
 
      }

      if (!userData) {
 
        const refreshToken = req.cookies.refresh;
 

        if (!refreshToken) {
          res.status(401).json({ success: false, message: "Unauthorized" });
          return;
        }

        const refreshData: any = await this.LoginUsecase.protectByjwt(
          refreshToken
        );
        if (!refreshData) {
          res.status(401).json({ success: false, message: "Token expired" });
          return;
        }

        userData = {
          name: refreshData.name,
          email: refreshData.email,
          role: refreshData.role,
        };

        const newAccessToken = await this.LoginUsecase.generatToken(userData);
        res.cookie("access", newAccessToken, {
          httpOnly: process.env.https == "true" ? true : false,
          secure: true,
          sameSite: "none",

          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        });
        req.body.accessTocken = newAccessToken;
      }

      if (userData?.email) {
        const foundUser = await this.LoginUsecase.findUserwithemail(
          userData.email
        );
        userData._id = userData._id;
        if (foundUser?.isBlocked) {
          res.clearCookie("refresh", { path: "/" });
          res.clearCookie("access", { path: "/" });
          res.status(401).json({
            success: false,
            message: "User has been blocked",
            isBlocked: true,
          });
          return;
        }
        userData = foundUser;
      }

      req.user = userData;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
      return;
    }
  };

}
