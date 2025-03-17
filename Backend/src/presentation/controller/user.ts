import { Request, Response, NextFunction } from "express";

import { handleError } from "../../utils/handleerror";

import axios from "axios";
import { Roles, userError } from "../../app/useCases/enum/User";

import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { IsignUpUser } from "../../app/useCases/Signup";
import { ILogin } from "../../domain/interface/Ilogin";
import { IAdmin } from "../../domain/interface/Iadmin";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { SystemError } from "../../app/useCases/enum/systemError";
import { SuccessMessage } from "../../app/useCases/enum/httpSuccess";
import { IUserModel } from "../../infra/database/models/User";
import bcrypt from "bcrypt";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import IsocketUsecase from "../../domain/interface/socket";
import { ImessageUsecase } from "../../domain/interface/ImessageUsecase";
import { MeetingDto } from "../../app/dtos/MeetingDto";

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
    private MeetingUsecase: ImessageUsecase
  ) {}
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);

      const data = await this.signUpUser.create(req.body);

      console.log("datais", data);
      res.cookie("varifyToken", data.token, {
        httpOnly: false,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        token: data.token,
        message: data.message,
      });
      return;
    } catch (error: any) {
      console.log("error in ", error);
      console.log("error code is ", error.statusCode);

      handleError(res, error, error.statusCode);
    }
  }

  async resendOtp(req: AuthServices, res: Response) {
    try {
      console.log(req.user, "user is doigshdfkilghdiuofhgd");

      const otp = await this.signUpUser.reOtp(req.user.userid);

      res.status(HttpStatusCode.OK).json(otp);
    } catch (error: any) {
      handleError(res, error, error.statusCode);
    }
  }

  async verifyed(req: AuthServices, res: Response) {
    try {
      console.log("idis", req.body.userid);

      await this.signUpUser.SavetoDb(req.body.userid);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log(req.body, "ingoo");
      const data = await this.LoginUsecase.logins(
        req.body.email,
        req.body.password
      );
      const tokess = JSON.parse(data.datas);
      res.cookie("refresh", tokess.refresh, {
        httpOnly: false,
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res.cookie("access", tokess.access, {
        httpOnly: false,
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
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.token;
      console.log(token, "in token");

      const isValid = await this.signUpUser.verifyOtp(req.body.otp, token);
      console.log("the untoken", isValid);

      if (isValid) {
        req.body = { userid: isValid.userid };

        next();
      }
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async verifyForgotpassword(req: Request, res: Response) {
    try {
      if (req.body.userid) {
        console.log("here", req.body.userid);

        const tocken = await this.LoginUsecase.forgotTocken(req.body.userid);

        res.status(HttpStatusCode.OK).json({ success: true, tocken: tocken });
      }
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async forgotPassOtpsent(req: Request, res: Response) {
    try {
      const token = await this.LoginUsecase.forgetpass(req.body.email);
      res.status(HttpStatusCode.OK).json({ success: true, token });
    } catch (error: any) {
      console.log(error);
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }

  async changepass(req: AuthServices, res: Response) {
    console.log("usersss", req.user);

    if (!req.user) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: userError.UserNotFound });
      return;
    }
    console.log("sdfasfasedgfasdthfiduw", req.body, req.user);
    if (!req.user.userid || !req.body.password) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "please check all feiled" });
      return;
    }
    await this.LoginUsecase.changepassword(req.user.userid, req.body.password);
    console.log(req.user, "returning");

    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "password changed" });
    return;
  }
  async reduxvarify(req: AuthServices, res: Response) {
    if (req.body.accessTocken) {
      console.log("yse");

      res.cookie("access", req.body.accessTocken, {
        httpOnly: false,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      });
    }
    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "varified success", user: req.user });
    return;
  }
  async glogin(req: AuthServices, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      console.log(token, "now nwo;");

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
      console.log("userdata is ", userData);

      const datas = await this.signUpUser.glogin(userData);
      console.log(datas, "is dasdgfsdfta");

      res.cookie("refresh", datas.token.refresh, {
        httpOnly: false,
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 7 day
      });
      res.cookie("access", datas.token?.access, {
        httpOnly: false,
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
      return this.logout(req, res);
    }
  }
  logout(req: Request, res: Response) {
    res.clearCookie("refresh", { path: "/" });
    console.log(req.cookies);
    console.log("deleted");

    res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "Session cleared, refresh token kept." });
    return;
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
      console.log(email);

      const data = await this.userUseCase.UseProfileByemail(email);
      const courseData = await this.getpurchasedCourses(
        data?.purchasedCourses as string[]
      );
      const progresdata = await this.CourseUseCase.getuserallCourseprogresdata(
        String(data?._id)
      );
      console.log(progresdata, "dataisissisisi");

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SuccessMessage.FETCH_SUCCESS,
        data: data,
        datas: courseData,
        progresdata,
      });
      console.log(data);
    } catch (err) {
      const error = err as CustomError;
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: SystemError.SystemError });
      return;
    }
  }
  async Beamentor(req: AuthServices, res: Response) {
    const {
      fullName,
      email,
      phoneNumber,
      profession,
      experience,
      areasOfExpertise,
      availability,
      motivation,
      resume,
      profileImage,
    } = req.body;
    const userid = req.user.userid;
  }
  async GetCourse(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.params;
      const { _id } = req.user;
      if (!req.user.email) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "please login before login",
        });
      }
      if (!courseid) {
        return;
      }
      console.log(_id, "ciddd");

      const meetid = await this.MeetingUsecase.getMeetByuserid(_id, courseid);
      console.log(meetid, "meetdatas");

      const user = await this.userUseCase.UseProfileByemail(req.user.email);
      const isvalid = user?.purchasedCourses?.includes(courseid);
      console.log(isvalid, "in buy course");
      if (isvalid == undefined) return;

      const reslt = await this.CourseUseCase.getSelectedCourse(
        courseid,
        isvalid,
        _id
      );
      console.log("in hjere");
      if (!reslt.progress) {
        delete reslt.progress;
      }
      console.log(JSON.stringify(reslt), "om tjos");

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched",
        data: reslt,
        adredypuchased: isvalid,
        meet: meetid ? meetid : false,
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.NOT_FOUND);
      return;
    }
  }
  async getAllcourseUser(req: AuthServices, res: Response) {
    try {
      const { limit, filter,most } = req.query;
      let isfilter = false;
      console.log(most,'most is ')
      
      if (most) {
        isfilter = true;
      }
      console.log(isfilter);
      
      const data = await this.CourseUseCase.getAllCourse(
        Number(limit),
        isfilter
      );
      console.log(JSON.stringify(data));
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched success",
        data,
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST);
    }
  }
  async BuyCourse(req: AuthServices, res: Response) {
    try {
      let userId;
      const { email } = req.user;
      const { courseId } = req.params;
      if (!courseId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Not Found",
        });
        return;
      }
      const user = await this.userUseCase.UseProfileByemail(email);
      if (user?.purchasedCourses?.includes(courseId)) {
        res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: "Student aldredy purchased",
        });
        return;
      }

      await this.CourseUseCase.purchaseCourse(String(user?._id), courseId);
      res.status(HttpStatusCode.OK).json({
        succes: true,
        message: "order succes",
      });
      return;
    } catch (error) {
      handleError(res, "An error occupied", HttpStatusCode.BAD_REQUEST);
    }
  }
  async getpurchasedCourses(data: string[]) {
    try {
      const datas = await this.CourseUseCase.getByCoursids(data);
      return datas;
    } catch (error) {
      throw new Error("An error occupied");
    }
  }
  async getchats(req: AuthServices, res: Response) {
    try {
      const { roomid } = req.params;
      const { email, _id } = req.user;
      console.log(roomid);

      const resp = await this.Socketusecase.findChatwithroom(roomid);
      console.log(_id, "uidss", resp);

      const ans =
        String(resp?.userId) == String(_id) ||
        String(resp?.mentorId == String(_id));
      console.log(ans, "results", resp?.userId, "  ", _id);
      if (!ans) {
        throw new Error("Room not fount");
      }
      const data = await this.Socketusecase.getAllmessageByroom(roomid);
      console.log(data, "chats");
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "succesfully fetch data",
        data,
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
      const { mentorId, courseId } = req.body;
      const { _id } = req.user;
      console.log(_id);

      await this.MeetingUsecase.create({
        courseId,
        mentorId,
        participants: [],
        scheduledTime: new Date(),
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
      const { _id } = req.user;
      console.log(req.user);
      const scheduledTime = new Date(UpdateTime);

      const meet = await this.MeetingUsecase.fetchMeetmyId(meetid);
      console.log(meet);
      if (!meet) {
        throw new Error("Room not found");
      }
      const isvalid = meet.userId == _id || meet.mentorId == _id;
      console.log(isvalid);
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
      console.log(data, "in form reuslts");

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
      console.log(id, _id);

      const data = await this.MeetingUsecase.leaveFrommeet(id, _id);
      console.log(data);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        succss: false,
        message: SystemError.SystemError,
      });
    }
  }
  async getQustionans(req: AuthServices, res: Response) {
    try {
      const { taskid } = req.params;
      const { anser } = req.body;
      const data = await this.CourseUseCase.getTaskByid(taskid);
      if (data && "Answer" in data && data.Answer == anser) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          message: "correct Answer",
        });
        return;
      } else {
        throw new Error("inccorect Answer");
      }
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
  // async changePassword(req: AuthServices, res: Response) {
  //   const email = req.user.email;
  //   const { oldpass,newpassword } = req.body;
  //   const user = await this.userUseCase.UseProfileByemail(email);
  //   const fonform = await bcrypt.compare(user?.password as string, oldpass as string);
  //   if(fonform){
  //     const newpass=await bcrypt.hash(newpassword,10)
  //     user?.password=newpass as string
  //     user.save()
  //   }
  // }
}
