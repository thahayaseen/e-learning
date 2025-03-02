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
  console.log(req.headers.authorization);

  try {
    let tocken = req.headers.authorization?.split(" ")[1];
    console.log("acces token", typeof tocken);

    let data;
    if (tocken) {
      data = await LoginUsecase.protectByjwt(tocken);
      console.log("acces token varified", typeof tocken);
    }
    console.log(data);

    if (!data) {
      console.log("no acces token no,refreshing ");
      const refresh = req.cookies.refresh;
      console.log("refresh token is", typeof refresh);

      if (!refresh) {
        res
          .status(401)
          .json({ success: false, message: userError.Unauthorised });
        return;
      }
      const refreshvarify = await LoginUsecase.protectByjwt(refresh);
      console.log(refreshvarify);

      if (!refreshvarify) {
        res.status(401).json({ success: false, message: "tocken expaied" });
        return;
      }
      data = {
        name: refreshvarify.role,
        email: refreshvarify.email,
        role: refreshvarify.role,
      };
      res.cookie("access", req.body.accessTocken, {
        httpOnly: false,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      });
      req.body.accessTocken = await LoginUsecase.generatToken(data);
    }
    req.user = data;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
    return;
  }
};
