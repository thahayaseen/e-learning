import { Request, Response, NextFunction } from "express";

import { HandleErrointerface, handleError } from "../../utils/handleerror";

import axios from "axios";
import { Roles, userError } from "../../app/useCases/enum/User";

import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { IsignUpUser } from "../../app/useCases/Signup.usecase";
import { ILogin } from "../../domain/interface/Ilogin";
import { IAdmin } from "../../domain/interface/Iadmin";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { SystemError } from "../../app/useCases/enum/systemError";
import { SuccessMessage } from "../../app/useCases/enum/httpSuccess";
import { IUserModel } from "../../infra/database/models/User";
import bcrypt from "bcrypt";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import IsocketUsecase from "../../domain/interface/socket";
import { IMeetusecase } from "../../domain/interface/ImessageUsecase";
import { MeetingDto } from "../../app/dtos/MeetingDto";

import RevenueUseCase from "../../app/useCases/revenue.usecase";
import { Middlewares, userServisess } from "../../config/dependencies";

export interface AuthServices extends Request {
  error?: string;
  user?: any;
}
interface CustomError {
  message: string;
}
export default class UserController {
  constructor(
    private signUpUser: IsignUpUser,
    private LoginUsecase: ILogin,
    private adminUsecase: IAdmin,
    private userUseCase: IuserUseCase,
    private CourseUseCase: ICourseUseCase,
    private Socketusecase: IsocketUsecase,
    private MeetingUsecase: IMeetusecase
  ) {}
  async create(req: Request, res: Response) {
    try {
      const data = await this.signUpUser.create(req.body);
      res.cookie("varifyToken", data.token, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
        sameSite: "none",
      });
      res.status(HttpStatusCode.OK).json({
        success: true,
        token: data.token,

        message: data.message,
        sameSite: "none",
      });
      return;
    } catch (error  ) {
      handleError(res, error, (error as HandleErrointerface).statusCode);
    }
  }

  async resendOtp(req: AuthServices, res: Response) {
    try {
      const otp = await this.signUpUser.reOtp(req.user.userid);
      res.status(HttpStatusCode.OK).json(otp);
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode);
    }
  }

  async verifyed(req: AuthServices, res: Response) {
    try {
      await this.signUpUser.SavetoDb(req.body.userid);
      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = await this.LoginUsecase.logins(
        req.body.email,
        req.body.password
      );
      const tokess = JSON.parse(data.datas);
      res.cookie("refresh", tokess.refresh, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res.cookie("access", tokess.access, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res
        .status(data?.success ? HttpStatusCode.OK : HttpStatusCode.UNAUTHORIZED)
        .json({
          success: data.success,
          message: data.message,
          // access: tokess.access,
          user: data.user,
        });
      return;
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
      let tocken;
      if (req.body.token) {
        tocken = req.body.token;
      } else {
        tocken = req.cookies.varifyToken;
      }
      const isValid = await this.signUpUser.verifyOtp(req.body.otp, tocken);
      if (isValid) {
        req.body = { userid: isValid.userid };

        next();
      }
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async verifyForgotpassword(req: Request, res: Response) {
    try {
      if (req.body.userid) {
        const tocken = await this.LoginUsecase.forgotTocken(req.body.userid);

        res.status(HttpStatusCode.OK).json({ success: true, tocken: tocken });
      }
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async forgotPassOtpsent(req: Request, res: Response) {
    try {
      const token = await this.LoginUsecase.forgetpass(req.body.email);
      res.status(HttpStatusCode.OK).json({ success: true, token });
    } catch (error) {
      handleError(res, error,  (error as HandleErrointerface).statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async changepass(req: AuthServices, res: Response) {
    if (!req.user) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: userError.UserNotFound });
      return;
    }
    if (!req.user.userid || !req.body.password) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "please check all feiled" });
      return;
    }
    await this.LoginUsecase.changepassword(req.user.userid, req.body.password);
    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "password changed" });
    return;
  }
  async reduxvarify(req: AuthServices, res: Response) {
    if (req.body.accessTocken) {
      res.cookie("access", req.body.accessTocken, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",

        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      });
    }
    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "varified success", user: req.user });
    return;
  }
  async glogin(req: AuthServices, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ success: false, message: "No token provided" });
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
      const datas = await this.signUpUser.glogin(userData);
      res.cookie("refresh", datas.token.refresh, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",

        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 7 day
      });
      res.cookie("access", datas.token?.access, {
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",

        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "google login success",
        token: datas.token?.access,
        user: datas.user,
      });
      return;
    } catch (error: any) {
      res.clearCookie("refresh", {
        path: "/",
        httpOnly: process.env.https == "true" ? true : false, // Ensures security
        secure: true, // Required for HTTPS
        sameSite: "none", // Allows cross-site access
      });
      res.clearCookie("access", {
        path: "/",
        httpOnly: process.env.https == "true" ? true : false,
        secure: true,
        sameSite: "none",
      });
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error ? error.message : "An unexpted error occured",
      });
      return;
    }
  }
  logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie("access", {
      httpOnly: process.env.https == "true" ? true : false,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refresh", {
      path: "/",
      httpOnly: process.env.https == "true" ? true : false,
      secure: true,
      sameSite: "none",
    });
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "Session cleared, refresh token kept.",
    });
    return;
  }
  async userData(req: AuthServices, res: Response) {
    try {
      const { role } = req.user;
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
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: "data fetched success",
          data: datas,
        });
      }
    } catch (error: any) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ success: false, message: error.message });
    }
  }

  // user profile and datas
  async uProfile(req: AuthServices, res: Response) {
    try {
      const email = req.user.email;
      const { page, limit } = req.query;
      const data = await this.userUseCase.UseProfileByemail(email);
      const courseData = await userServisess.getpurchasedCourses(
        data?.purchasedCourses?.reverse() as string[],
        String(data?._id),
        Number(page),
        Number(limit)
      );
      const progresdata = await this.CourseUseCase.getuserallCourseprogresdata(
        String(data?._id)
      );
      const mentorRequst = await this.userUseCase.getuserMentorRequst(
        String(data?._id)
      );
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SuccessMessage.FETCH_SUCCESS,
        data: data,
        datas: courseData,
        progresdata,
        mentorRequst,
      });
    } catch (err) {
      const error = err as CustomError;
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: SystemError.SystemError });
      return;
    }
  }

  async getchats(req: AuthServices, res: Response) {
    try {
      const { roomid } = req.params;
      const { email, _id } = req.user;
      const resp = await this.Socketusecase.findChatwithroom(roomid);
      const ans =
        String(resp?.userId) == String(_id) ||
        String(resp?.mentorId == String(_id));
      if (!ans) {
        throw new Error("Room not fount");
      }
      const data: any = await this.Socketusecase.getAllmessageByroom(roomid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "succesfully fetch data",
        data,
        remortUser: resp?.mentorId?.name,
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: true,
        message: "cannot fetch data",
      });
    }
  }
  async Requesmeeting(req: AuthServices, res: Response) {
    try {
      const { mentorId, courseId, scheduledTime } = req.body;
      const { _id } = req.user;
      await this.MeetingUsecase.create({
        courseId,
        mentorId,
        participants: [],
        scheduledTime: new Date(scheduledTime),
        userId: _id,
        status: "pending",
      });
      res.status(HttpStatusCode.OK).json({
        succes: true,
        message: "succesfully completed",
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        succes: false,
        message: error.message,
      });
    }
  }
  async UpdateTime(req: AuthServices, res: Response) {
    try {
      const { UpdateTime } = req.body;
      const { meetid } = req.params;
      const { _id, role } = req.user;
      const scheduledTime = new Date(UpdateTime);
      const meet = await this.MeetingUsecase.fetchMeetmyId(meetid);
      if (!meet) {
        throw new Error("Room not found");
      }
      const isvalid = meet.userId == _id || meet.mentorId == _id;
      if (isvalid) {
        throw new Error(userError.Unauthorised);
      }
      await this.MeetingUsecase.updateMeetTime(meetid, scheduledTime);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Time updated success",
      });
    } catch (error: any) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
  }
  async addUsermeet(req: AuthServices, res: Response) {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const data = await this.MeetingUsecase.addUsertomeet(id, _id);
      res.status(HttpStatusCode.OK).json({ success: true, data });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        succss: false,
        message: SystemError.SystemError,
      });
    }
  }
  async leaveMeeting(req: AuthServices, res: Response) {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const data = await this.MeetingUsecase.leaveFrommeet(id, _id);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        succss: false,
        message: SystemError.SystemError,
      });
    }
  }

  async updateVideoProgress(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const {
        courseId,
        lessonId,
        taskId,
        taskType,
        watchTime,
        isCompleted,
        response,
      } = req.body;

      const updateData = {
        watchTime,
        isCompleted,
        response,
      };
      console.log(
        _id, // studentId
        courseId,
        lessonId,
        taskId,
        taskType,
        updateData
      );
      const updatedData = await this.CourseUseCase.updateTaskProgress(
        _id, // studentId
        courseId,
        lessonId,
        taskId,
        taskType,
        updateData
      );
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Video progress updated successfully.",
        data: updatedData,
      });
    } catch (error: any) {
      // Send error response
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message || "An error occurred while updating video progress.",
      });
    }
  }
  async updatacompleteLesson(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const { courseId, lessonId } = req.body;
      const data = await this.CourseUseCase.markLessonCompleteduseCase(
        _id,
        courseId,
        lessonId
      );
      res.status(200).json({ success: true, data });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update progress",
      });
      return;
    }
  }
  async getSelectedProgressContorller(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.params;
      const { _id } = req.user;
      const data = await this.CourseUseCase.getSelectedProgress(courseid, _id);
      if (!data) {
        throw new Error("Progress Not found");
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "succesfuly fetched data",
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
  async requestMentor(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const data = req.body;
      await this.userUseCase.requstbeMentor(_id, data);
      res.status(HttpStatusCode.OK).json({
        successa: true,
        message: "succesfuly created",
      });
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || SystemError.SystemError,
      });
    }
  }
  async changeProfile(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const data = req.body;
 

      await this.userUseCase.updateUserdata(_id, data);
      res.status(HttpStatusCode.OK).json({ success: true, message: "updated" });
      return;
    } catch (error: any) {
 

      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Some error occured",
      });
      return;
    }
  }
  async changePassword(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const { oldPassoword, newPassword } = req.body;
      await this.userUseCase.changePawword(_id, oldPassoword, newPassword);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Password updated",
      });
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: error.message || "Some Error Occured",
      });
      return;
    }
  }
}
