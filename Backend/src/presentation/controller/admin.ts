import { adminUsecase, adminUsecaseType } from "../../config/dependencies";
import { json, Request, Response } from "express";
import { Roles, userError } from "../../app/useCases/enum/User";
import { AuthServices } from "./user";
import { SystemError } from "../../app/useCases/enum/systemError";
import { IAdminUsecase } from "../../app/useCases/admin";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { SuccessMessage } from "../../app/useCases/enum/httpSuccess";
import { ImentorRequestRepo } from "../../domain/repository/ImentroRequstrepository";
import { UserUsecase } from "../../app/useCases/User";

export default class Admincontroler {
  constructor(
    private adminUsecase: IAdminUsecase,
    private userUsecase: UserUsecase
  ) {}
  async blockUser(req: AuthServices, res: Response) {
    try {
      console.log(req.user);

      if (req.user.role !== Roles.ADMIN) {
        throw new Error(userError.Unauthorised);
      }
      console.log("yses", req.body);
      if (String(req.user._id) == String(req.body.userid)) {
        throw new Error("Cannot self Block");
      }
      await this.adminUsecase.Blockuser(req.body.userid, req.body.type);
      res
        .status(HttpStatusCode.OK)
        .json({ message: `user ${req.body.type ? "bloked" : "unbloked"}` });
    } catch (error) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        message:
          error instanceof Error ? error.message : SystemError.SystemError,
      });
      return;
    }
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
        const datas = await this.adminUsecase.getuserAdata({ page, limit });

        console.log(datas, "fasasdg");

        res.status(HttpStatusCode.OK).json({
          success: true,
          message: "data fetched success",
          data: datas?.formattedData,
          totalpages: datas?.totalpages,
        });
      }
    } catch (error: any) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ success: false, message: error.message });
    }
  }
  async createCategorys(req: AuthServices, res: Response) {
    try {
      console.log("adding");
      if (req.user.role !== Roles.ADMIN) {
        res.status(HttpStatusCode.BAD_REQUEST);
        return;
      }

      const { name, description } = req.body;
      const datass = await this.adminUsecase.getCategoryNameUsecase(name);
      console.log(datass);

      if (datass) {
        throw new Error("Category aldredy exsist");
      }
      const data = await this.adminUsecase.createCategory(name, description);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SuccessMessage.CREATE_SUCCESS,
        data: data,
      });
      return;
    } catch (err: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: err.message || SystemError.SystemError,
      });
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
      console.log(data, "editing");

      if (data && data.Category) {
        console.log(data.Category, "categoryis");

        const result = await this.adminUsecase.getCategoryNameUsecase(
          data.Category
        );
        console.log(result);

        if (result) {
          throw new Error(`This Category Aldredy exsist's`);
        }
      }

      await this.adminUsecase.changeCategory(categoryid, data);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "compleated suucees",
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || SystemError.SystemError,
      });
    }
  }
  async actionCategory(req: AuthServices, res: Response) {
    try {
      const { categoryid } = req.params;
      if (req.user.role !== Roles.ADMIN) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: userError.Unauthorised,
        });
        return;
      }
      console.log("typessis", typeof req.body.type);

      await this.adminUsecase.actionCourse(categoryid, req.body.type);
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
  async getAllmentorrequst(req: AuthServices, res: Response) {
    try {
      const { _id, role } = req.user;
      console.log(role, "roeis");

      if (role !== Roles.ADMIN) {
        throw new Error("Only admin have access to this api");
      }
      const { page } = req.query || 1;
      const filter = req.query;
      console.log(filter);

      const data = await this.userUsecase.getAllrequst(Number(page), filter);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "successfully fetch data",
        data,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || SystemError.SystemError,
      });
      return;
    }
  }
  async actionToRequst(req: AuthServices, res: Response) {
    try {
      const { role } = req.user;
      if (role !== Roles.ADMIN) {
        throw new Error("Only admin have access to this");
      }
      const { dataid } = req.params;
      const { action } = req.body;
      console.log("action is ", action);

      const data = await this.userUsecase.updateRequst(dataid, action);
      console.log(data.userid);
      if (action == "accepted") {
        await this.userUsecase.changeUserRoleUsecase(data.userid, "mentor");
      }
      res.status(HttpStatusCode.OK).json({
        success: false,
        message: "updated ",
        data,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || SystemError.SystemError,
      });
      return;
    }
  }
}
