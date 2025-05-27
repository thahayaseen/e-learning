import { Response } from "express";
import { Roles, userError } from "../../app/useCases/enum/User";
import { AuthServices } from "./user.controller";
import { SystemError } from "../../app/useCases/enum/systemError";
import { IAdminUsecase } from "../../app/useCases/admin.usecase";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { SuccessMessage } from "../../app/useCases/enum/httpSuccess";

import { UserUsecase } from "../../app/useCases/User.usecase";

export default class Admincontroler {
  constructor(
    private adminUsecase: IAdminUsecase,
    private userUsecase: UserUsecase
  ) {}
  async blockUser(req: AuthServices, res: Response) {
    try {
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
      const { page, limit, search, statusFilter, rolefilter } = req.query;
      if (!page || !limit) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ success: false, message: "credential error" });
        return;
      }
      const filter = {
        statusFilter: typeof statusFilter == "string" ? statusFilter : "",
        rolefilter: typeof rolefilter == "string" ? rolefilter : "",
      };
      if (typeof page == "string" && typeof limit == "string") {
        const datas = await this.adminUsecase.getuserAdata({
          page,
          limit,
          search: typeof search == "string" ? search : "",
          filter,
        });

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
      const { name, description } = req.body;
      const datass = await this.adminUsecase.getCategoryNameUsecase(name);

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
      const { categoryid } = req.params;
      const { data } = req.body;

      if (data && data.Category) {
        const result = await this.adminUsecase.getCategoryNameUsecase(
          data.Category
        );

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
      const { type } = req.params;
      const { page, filter } = req.query;
      console.log(filter);

      const data = await this.adminUsecase.unaprovedgetCourses(
        Number(page),
        type,
        filter
      );

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
      const { page } = req.query || 1;
      const filter = req.query;

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

      const data = await this.userUsecase.updateRequst(dataid, action);

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
  async Approve_RejectCourse(req: AuthServices, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      if (!id || action == undefined) {
        throw new Error("need more credencial");
      }
      console.log(action,'action is');
      
      await this.adminUsecase.MainAcTion(id, action);
      res.status(HttpStatusCode.OK).json({
        success:true
      })
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success:false,

      })
    }
  }
}
