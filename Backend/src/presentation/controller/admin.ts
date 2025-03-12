import { adminUsecase, adminUsecaseType } from "../../config/dependencies";
import { Request, Response } from "express";
import { Roles, userError } from "../../app/useCases/enum/User";
import { AuthServices } from "./user";
import { SystemError } from "../../app/useCases/enum/systemError";
import { IAdminUsecase } from "../../app/useCases/admin";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { SuccessMessage } from "../../app/useCases/enum/httpSuccess";

export default class Admincontroler {
  constructor(private adminUsecase: IAdminUsecase) {}
  async blockUser(req: AuthServices, res: Response) {
    try {
      console.log(req.user);

      if (req.user.role !== Roles.ADMIN) {
        throw new Error(userError.Unauthorised);
      }
      console.log("yses");

      await this.adminUsecase.Blockuser(req.body.userid, req.body.type);
      res
        .status(200)
        .json({ message: `user ${req.body.type ? "bloked" : "unbloked"}` });
    } catch (error) {
      res.status(401).json({ message: SystemError.SystemError });
      return;
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
      if (typeof page == "string" && typeof limit == "string") {
        const datas = await this.adminUsecase.getuserAdata({ page, limit });

        console.log(datas, "fasasdg");

        res.status(200).json({
          success: true,
          message: "data fetched success",
          data: datas?.formattedData,
          totalpages:datas?.totalpages
        });
      }
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
  async createCategorys(req: AuthServices, res: Response) {
    try {

      console.log('adding');
      if (req.user.role !== Roles.ADMIN) {
        res.status(HttpStatusCode.BAD_REQUEST);
        return;
      }
      
      const { name, description } = req.body;
      const data = await this.adminUsecase.createCategory(name, description);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SuccessMessage.CREATE_SUCCESS,
        data: data,
      });
      return;
    } catch (err) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ success: false, message: SystemError.SystemError });
      return;
    }
  }
  async editCategory(req: AuthServices, res: Response) {
    try {
      const { email, role } = req.user;
      if (role !== Roles.ADMIN) {
        res.status(HttpStatusCode.BAD_REQUEST);
        return;
      }
      const { categoryid } = req.params;
      const { data } = req.body;
      console.log(data);

      await this.adminUsecase.changeCategory(categoryid, data);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "compleated suucees",
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: SystemError.SystemError,
      });
    }
  }
  async deleteCategory(req: AuthServices, res: Response) {
    try {
      const { categoryid } = req.params;
      if (req.user.role !== Roles.ADMIN) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: userError.Unauthorised,
        });
        return;
      }

      await this.adminUsecase.deleteCourse(categoryid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        messsage: "successfully deleted",
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
  async getCourseunaproved(req: AuthServices, res: Response) {
    try {
      if (req.user.role !== Roles.ADMIN) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: userError.Unauthorised,
        });
        return;
      }
      const { page, type } = req.params;
      console.log("page is ", page, type, req.params);

      const data = await this.adminUsecase.unaprovedgetCourses(
        Number(page),
        type
      );
      console.log(data);
      if (!data) {
        throw new Error("not fount");
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "data fetched",
        data,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
}
