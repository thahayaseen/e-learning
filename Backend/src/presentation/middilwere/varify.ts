
import { Request, Response, NextFunction } from "express";
import { LoginUsecase } from "../../config/dependencies";
import { userError } from "../../domain/enum/User";
interface AuthServices extends Request {
  error?: string;
  user?: any;
}


export const jwtVerify = async(req: AuthServices, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; 
console.log('token is ',typeof token);

  // if (!token) {
  //   console.log('thius');
    
  //    res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  //    return
  // }

  try {
    
    let tocken = req.headers.authorization?.split(" ")[1];
    console.log(tocken, "in jwt middlewerfsae");
   
    let data;
    if (tocken) {
      data =await LoginUsecase.protectByjwt(tocken);
    }
    console.log(data);
    
    if (!data) {
      const refresh =  req.cookies.refresh;
      console.log(refresh, "tocken is refrashis no ");
      if (!refresh) {
        res.status(404).json({ success: false, message: "user not found" });
        return;
      }
      const refreshvarify =await LoginUsecase.protectByjwt(refresh);
      console.log(refreshvarify);
      
      if (!refreshvarify) {
        res.status(401).json({ success: false, message: "tocken expaied" });
        return;
      }
      data={
        name: refreshvarify.role,
        email: refreshvarify.email,
        role: refreshvarify.role,
      }
      
      req.body.accessTocken =await LoginUsecase.generatToken(data);

    }
    req.user = data;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  return
  }
};

  // async jwtmiddlewere(req: AuthServices, res: Response, next: NextFunction) {
  //   let tocken = req.headers.authorization?.split(" ")[1];
  //   console.log(tocken, "in jwt middlewerfsae");
  //   const refresh = await req.cookies;
  //   console.log(refresh, "tocken is refrashis no ");
  //   let data;
  //   if (tocken) {
  //     data = jwt.verifyToken(tocken);
  //   }
  //   if (!data) {
  //     const refresh = await req.cookies.refresh;
  //     console.log(refresh, "tocken is refrashis no ");
  //     if (!refresh) {
  //       res.status(404).json({ success: false, message: "user not found" });
  //       return;
  //     }
  //     const refreshvarify = jwt.verifyToken(refresh);
  //     if (!refreshvarify) {
  //       res.status(401).json({ success: false, message: "tocken expaied" });
  //       return;
  //     }
  //     req.body.accessTocken = jwt.generateToken({
  //       name: refreshvarify.role,
  //       email: refreshvarify.email,
  //       roll: refreshvarify.role,
  //     });
  //   }
  //   req.user = data;
  //   next();
  // }