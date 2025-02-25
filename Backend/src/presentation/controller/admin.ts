import { adminUsecase, adminUsecaseType } from "../../config/dependencies";
import { Request, Response } from "express";
import { Roles, userError } from "../../app/useCases/enum/User";
import { AuthServices } from "./user";
import { SystemError } from "../../app/useCases/enum/systemError";
import { IAdminUsecase } from "../../app/useCases/admin";

export default class Admincontroler {
  constructor(private adminUsecase:IAdminUsecase) {}
  async blockUser(req: AuthServices, res: Response) {
   try {
    console.log(req.user);
    
    if (req.user.role !== Roles.ADMIN){
      throw new Error(userError.Unauthorised)
    }
      console.log('yses');
      
      await this.adminUsecase.Blockuser(req.body.userid, req.body.type);
    res.status(200).json({message:`user ${req.body.type?"bloked":"unbloked"}`})
      
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
      const datas = await this.adminUsecase.getuserAdata({ page , limit });

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
