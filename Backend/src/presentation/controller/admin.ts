import { adminUsecase, adminUsecaseType } from "../../config/dependencies";
import { Request, Response } from "express";
import { Roles, userError } from "../../domain/enum/User";
import { AuthServices } from "./user";
import { SystemError } from "../../domain/enum/systemError";

export default class Admincontroler {
  // constructor() {}
  async blockUser(req: AuthServices, res: Response) {
   try {
    console.log(req.user);
    
    if (req.user.role !== Roles.ADMIN){
      throw new Error(userError.Unauthorised)
    }
      console.log('yses');
      
      await adminUsecase.Blockuser(req.body.userid, req.body.type);
    res.status(200).json({message:`user ${req.body.type?"unbloked":"bloked"}`})
      
   } catch (error) {
    res.status(401).json({message:SystemError.SystemError})
    return
   }
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
     if(typeof page=='string'&&typeof limit =='string'){
      const datas = await adminUsecase.getuserAdata({ page , limit });

      console.log(datas,'fasasdg');

      res
        .status(200)
        .json({ success: true, message: "data fetched success", data: datas });
     }

    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
