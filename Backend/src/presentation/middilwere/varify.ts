import { Request, Response, NextFunction } from "express";
import { LoginUsecase } from "../../config/dependencies";
import { userError } from "../../app/useCases/enum/User";

interface AuthServices extends Request {
  error?: string;
  user?: any;
}

export const jwtVerify = async (
  req: AuthServices,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { publicRoute } = req.query;
    // if (publicRoute == "true") {
    //   next();
    // }
    console.log("Authorization Header:", req.headers.authorization);
    let token = req.headers.authorization?.split(" ")[1];
    let userData = null;

    if (token) {
      userData = await LoginUsecase.protectByjwt(token);
      console.log("Access token verified:", userData);
    }

    if (!userData) {
      console.log("No access token, checking refresh token...");
      const refreshToken = req.cookies.refresh;
      console.log("Cookies:", req.cookies);

      if (!refreshToken) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const refreshData = await LoginUsecase.protectByjwt(refreshToken);
      if (!refreshData) {
        res.status(401).json({ success: false, message: "Token expired" });
        return;
      }

      userData = {
        name: refreshData.name,
        email: refreshData.email,
        role: refreshData.role,
      };

      const newAccessToken = await LoginUsecase.generatToken(userData);
      res.cookie("access", newAccessToken, {
        httpOnly: true,
        secure:true,
        sameSite:'none',

        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      });
      req.body.accessTocken = newAccessToken;
    }

    if (userData?.email) {
      const foundUser = await LoginUsecase.findUserwithemail(userData.email);
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
