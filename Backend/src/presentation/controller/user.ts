import { Request, Response, NextFunction } from "express";
import { userCases, login, userRepo } from "../../config/users";
import { handleError } from "../../utils/handleerror";
import redis from "../../config/redis";
import axios from "axios";
import jwt from "../../config/jwt";
interface AuthServices extends Request {
  error?: string;
  user?: any;
}

export default class UserController {
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);

      const data = await userCases.create(req.body);
      if (!data) {
        res
          .status(200)
          .json({ success: false, message: "User already exists" });
        return;
      }
      res.status(200).json({
        success: true,
        data: { userid: data.uid },
        message: data.message,
      });
    } catch (error: any) {
      console.log("error in ", error);
      console.log("error code is ", error.statusCode);

      handleError(res, error, error.statusCode);
    }
  }

  async resendOtp(req: AuthServices, res: Response) {
    try {
      const otp = await userCases.reOtp(req.body.userid);

      res.status(200).json(otp);
    } catch (error: any) {
      handleError(res, error, error.statusCode);
    }
  }

  async verify(req: AuthServices, res: Response) {
    try {
      await userCases.SavetoDb(req.body.userid);

      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error, 401);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = await login.logins(req.body.email, req.body.password);
      console.log(data);
      
      res.cookie("refresh", "data.datas.refresh", { httpOnly: true });
      res
        .status(data?.success ? 200 : 401)
        .json({ success: data.success,message:data.message, accsess: data.datas.accses,user:data.user });
      return;
    } catch (error) {
      handleError(res, error, 401);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
      let ids: string;
      if (req.body.email) {
        const temp = await userRepo.findByEmail(req.body.email);
        const email = req.body.email;
        console.log(email, "otpsiis");

        if (!temp || !temp._id) {
          throw new Error("User not fount");
        }
        ids = temp._id.toString();
      } else {
        ids = req.body.userid;
      }
      if (!ids) {
        handleError(res, "User not found", 404);
      }
      const isValid = await userCases.verifyOtp(req.body.otp, ids);
      if (isValid) {
        req.body = { userid: ids };

        next();
      }
    } catch (error) {
      handleError(res, error, 401);
    }
  }
  async verifyFps(req: Request, res: Response) {
    try {
      if (req.body.userid) {
        console.log("here", req.body.userid);

        const tocken = await redis.createTockens(req.body.userid);
        console.log(tocken);

        res.status(200).json({ success: true, tocken: tocken });
      }
    } catch (error) {
      handleError(res, error, 401);
    }
  }

  async forgotPass(req: Request, res: Response) {
    try {
      await login.forgetpass(req.body.email);
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      handleError(res, error, 401);
    }
  }
  async jwtmiddlewere(req: AuthServices, res: Response, next: NextFunction) {
    let tocken = req.headers.authorization?.split(" ")[1];
    console.log(tocken, "in jwt middlewerfsae");
    const refresh = await req.cookies;
    console.log(refresh, "tocken is refrashis no ");
    let data;
    if (tocken) {
      data = jwt.verifyToken(tocken);
    }
    if (!data) {
      const refresh = await req.cookies.refresh;
      console.log(refresh, "tocken is refrashis no ");
      if (!refresh) {
         res
          .status(404)
          .json({ success: false, message: "user not found" });
          return
      }
      const refreshvarify = jwt.verifyToken(refresh);
      if (!refreshvarify) {
        res.status(401).json({ success: false, message: "tocken expaied" });
        return;
      }
      req.body.accessTocken = jwt.generateToken({
        name: refreshvarify.role,
        email: refreshvarify.email,
        roll: refreshvarify.role,
      });
    }
    req.user = data;
    next();
  }
  async changepass(req: AuthServices, res: Response) {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Usernot fount" });
      return;
    }
    console.log("sdfasfasedgfasdthfiduw", req.body.password);

    login.changepassword(req.user.userid, req.body.password);
    res.status(200).json({ success: true, message: "password changed" });
  }
  async reduxvarify(req: AuthServices, res: Response) {
    res.status(200).json({ success: true, message: req.user });
    return;
  }
  async glogin(req: AuthServices, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token, "fsadllkj;");

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
      const data = await userCases.glogin(userData);
      console.log(data);
      if (data.success) {
        console.log("jtokens reach");

        const jtoken = await jwt.generateToken({
          name: userData?.name,
          email: userData?.email,
        });
        const Rtoken = jwt.RefreshToken({
          name: userData?.name,
          email: userData?.email,
        });
        console.log(jtoken, "jtocken");
        console.log(Rtoken, "Rtocken");
        res.cookie("refresh", Rtoken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        });
        res.status(200).json({
          message: "successfully logind",
          accessTocken: jtoken.accses,
          user: {
            name: userData.name,
            email: userData.email,
            role: data.role,
          },
        });
        return;
      }
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
}
