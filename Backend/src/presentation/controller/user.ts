import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
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
import { orderDto } from "../../app/dtos/orderDto";
import RevenueUseCase from "../../app/useCases/revenue.usecase";

export interface AuthServices extends Request {
  error?: string;
  user?: any;
}
interface CustomError {
  message: string;
}
export default class UserController {
  private stripe;
  constructor(
    private signUpUser: IsignUpUser,
    private LoginUsecase: ILogin,
    private adminUsecase: IAdmin,
    private userUseCase: IuserUseCase,
    private CourseUseCase: ICourseUseCase,
    private Socketusecase: IsocketUsecase,
    private MeetingUsecase: ImessageUsecase,
    private revenueUseCase: RevenueUseCase
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);

      const data = await this.signUpUser.create(req.body);

      console.log("datais", data);
      res.cookie("varifyToken", data.token, {
        httpOnly: true,
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
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 15 minutes
      });
      res.cookie("access", tokess.access, {
        httpOnly: true,
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
    } catch (error: any) {
      handleError(res, error, error.statusCode || HttpStatusCode.UNAUTHORIZED);
    }
  }
  async otpverify(req: Request, res: Response, next: NextFunction) {
    try {
     
      const tocken=req.cookies.varifyToken
      console.log(tocken,'token is ');
      
      const isValid = await this.signUpUser.verifyOtp(req.body.otp, tocken);
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
        httpOnly: true,
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
        httpOnly: true,
        secure: true,
        sameSite: "none",

        expires: new Date(Date.now() + 7 * 60 * 60 * 1000), // Expires in 7 day
      });
      res.cookie("access", datas.token?.access, {
        httpOnly: true,
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
      console.log(error.message, "message is ");
      res.clearCookie("refresh", {
        path: "/",
        httpOnly: true, // Ensures security
        secure: true, // Required for HTTPS
        sameSite: "none", // Allows cross-site access
      });
      res.clearCookie("access", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error ? error.message : "An unexpted error occured",
      });
      return;
      // return this.logout(req, res,next,error.message);
    }
  }
  logout(req: Request, res: Response, next: NextFunction) {
    console.log("logouting");

    res.clearCookie("access", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refresh", {
      path: "/",
      httpOnly: true,
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
        data?.purchasedCourses as string[],
        String(data?._id)
      );
      const progresdata = await this.CourseUseCase.getuserallCourseprogresdata(
        String(data?._id)
      );
      const mentorRequst = await this.userUseCase.getuserMentorRequst(
        String(data?._id)
      );
      console.log(mentorRequst, "fdafsdasfsdfa");

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SuccessMessage.FETCH_SUCCESS,
        data: data,
        datas: courseData,
        progresdata,
        mentorRequst,
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
      const {
        limit,
        page,
        search,
        level,
        category,
        priceMin,
        priceMax,
        mentor,
        sort,
        order,
        publicRoute,
      } = req.query;
      let token = req.headers.authorization?.split(" ")[1];
      let userData: any = null;

      if (token) {
        userData = await this.LoginUsecase.protectByjwt(token);
        console.log("Access token verified:", userData);
      }

      // Build filter object
      const filter: any = {};

      // Add search filter
      if (search) {
        filter.search = search as string;
      }

      // Add level filter
      if (level) {
        filter.level = level as string;
      }

      // Add category filter
      if (category) {
        filter.category = category as string;
      }

      // Add mentor filter
      if (mentor) {
        filter.mentor = mentor as string;
      }

      // Add price filter
      if (priceMin || priceMax) {
        filter.price = {};
        if (priceMin) {
          filter.price.min = Number(priceMin);
        }
        if (priceMax) {
          filter.price.max = Number(priceMax);
        }
      }

      // Build sort configuration
      const sortConfig = {
        field: (sort as string) || "UpdatedAt",
        order: (order as "asc" | "desc") || "desc",
      };
      if (
        !userData ||
        !userData.role ||
        [Roles.STUDENT].includes(userData?.role)
      ) {
        filter.fromUser = true;
      }
      console.log(filter, "filter is ");

      // Get
      //  courses with pagination, filtering and sorting
      const data = await this.CourseUseCase.getAllCourse(
        Number(page || 1),
        Number(limit || 10),
        sortConfig,
        filter
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched success",
        data,
      });
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Failed to fetch courses",
        error: error.message,
      });
    }
  }
  async BuyCourse(req: AuthServices, res: Response) {
    try {
      let userId;
      const { email, _id } = req.user;
      const { courseId } = req.params;
      if (!courseId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Not Found",
        });
        return;
      }
      const requestData = req.body.data;
      console.log(requestData);
      console.log(req.user);

      if (!_id || !email) {
        throw new Error("cannot get uesr data");
      }

      const user = await this.userUseCase.UseProfileByemail(email);
      if (user?.purchasedCourses?.includes(courseId)) {
        res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: "Student aldredy purchased",
        });
        return;
      }
      await this.CourseUseCase.checkOrderDupication(_id, courseId, true);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: requestData.courseName,
              },
              unit_amount: requestData.price * 100, // Stripe expects amount in cents/paise
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://${process.env.NEXT_PUBLIC_SERVER}/paymentstatus?status=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://${process.env.NEXT_PUBLIC_SERVER}/paymentstatus?status=false&session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          courseId: requestData.courseId,
          planType: requestData.planType,
        },
      });
      let results = await this.CourseUseCase.checkOrderDupication(
        _id,
        courseId,
        false
      );
      if (!results) {
        results = await this.CourseUseCase.createOrder({
          amount: requestData.price,
          courseId: requestData.courseId,
          currency: "inr",
          planType: requestData.planType,
          userId: _id,
          paymentId: String(session.payment_intent),
          sessionId: session.id,
        });
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "order created ",
        url: session.url,
        id: session.id,
        orderid: results._id,
      });
      return;
    } catch (error: any) {
      console.log(error.message);

      handleError(
        res,
        error || "An error occupied",
        HttpStatusCode.BAD_REQUEST
      );
    }
  }
  async getpurchasedCourses(data: string[], userid: string) {
    try {
      console.log("course id is", userid);

      const datas = await this.CourseUseCase.getByCoursids(data, userid);
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
      const data: any = await this.Socketusecase.getAllmessageByroom(roomid);
      console.log(data, "chats");
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
      console.log(_id);

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
      // console.log(req.user);
      // if (role !== Roles.MENTOR) {
      //   throw new Error("Mentor have only access");
      // }
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
      const { answer } = req.body;
      const data = await this.CourseUseCase.getTaskByid(taskid);
      console.log(data, answer);
      console.log(data && "Answer" in data && data.Answer == answer);

      if (data && "Answer" in data && data.Answer == answer) {
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
  async stripeSesstion(req: AuthServices, res: Response) {
    try {
      const requestData = req.body.data;
      console.log(requestData);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: requestData.courseName,
              },
              unit_amount: requestData.price * 100, // Stripe expects amount in cents/paise
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://${process.env.NEXT_PUBLIC_SERVER}/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://${process.env.NEXT_PUBLIC_SERVER}/courses/${requestData.courseId}`,
        metadata: {
          courseId: requestData.courseId,
          planType: requestData.planType,
        },
      });
      res.status(200).json({
        success: true,
        message: "created",
        url: session.url,
        id: session.id,
      });
      return;
    } catch (error: any) {
      console.log(error.message);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: SystemError.SystemError,
      });
    }
  }
  async paymentsuccss(req: AuthServices, res: Response) {
    try {
      const { _id, purchasedCourses } = req.user;
      const sesstion = req.query.session_id;
      const orderid = req.query.orderid;
      const status = req.query.status == "true";
      console.log(orderid, "oid is ", status);
      if (!orderid) {
        throw new Error("Order id cannot Found");
      }

      const data = await this.stripe.checkout.sessions.listLineItems(
        String(sesstion)
      );
      const session = await this.stripe.checkout.sessions.retrieve(
        String(sesstion)
      );
      console.log(session);
      const courseid = session.metadata?.courseId;
      console.log(courseid);
      if (!courseid) {
        throw new Error("Cannot Find Course");
      }
      console.log(purchasedCourses, courseid, "datassd");

      if (purchasedCourses.includes(String(courseid))) {
        throw new Error("User aldredy purchased");
      }
      let updata: Partial<orderDto> = {
        paymentStatus: status ? "paid" : "failed",
        paymentId: String(session.payment_intent),
      };

      const result = await this.CourseUseCase.Conformpayment(
        updata,
        String(orderid)
      );
      console.log(result, "resut is ");

      await this.CourseUseCase.purchaseCourse(
        String(result?.userId),
        result.courseId
      );

      console.log("Course ID:", session.metadata?.courseId); // Access stored metadata
      console.log("Plan Type:", session.metadata?.planType);
    } catch (error: any) {
      console.log(error, "the error is ");

      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: error.message || "Failed" });
    }
  }

  async updateVideoProgress(req: AuthServices, res: Response) {
    try {
      // Extract data from the request
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

      // Update video progress using the use case
      const updatedData = await this.CourseUseCase.updateTaskProgress(
        _id, // studentId
        courseId,
        lessonId,
        taskId,
        taskType,
        updateData
      );

      console.log("Video progress updated:", updatedData);

      // Send success response
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Video progress updated successfully.",
        data: updatedData,
      });
    } catch (error: any) {
      console.error("Error updating video progress:", error);

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
      console.log(_id, "id is ");

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
  async addReivews(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const { courseid, rating, title, comment } = req.body;
      await this.CourseUseCase.addRating(_id, courseid, rating, title, comment);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "addes success",
      });
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || "Unable to complete",
      });
    }
  }
  async getAllReviews(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.params;
      if (!courseid) throw new Error("course not found");
      const data = await this.CourseUseCase.getallReviews(courseid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "succesfully Fetch data",
        data,
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.OK).json({
        success: false,
        message: "Failed to fetch data",
      });
      return;
    }
  }
  async requestMentor(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const data = req.body;
      console.log(data);

      await this.userUseCase.requstbeMentor(_id, data);
      res.status(HttpStatusCode.OK).json({
        successa: true,
        message: "succesfuly created",
      });
    } catch (error: any) {
      console.log(error);

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
      console.log(data, "resutl is ");

      await this.userUseCase.updateUserdata(_id, data);
      res.status(HttpStatusCode.OK).json({ success: true, message: "updated" });
      return;
    } catch (error: any) {
      console.log(error.message);

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
  async orders(req: AuthServices, res: Response) {
    try {
      const { page, limit } = req.query;
      const { _id, role } = req.user;
      console.log(_id, page, limit, "datasss");
      if (!_id || !page || !limit) {
        throw new Error("Please send valid data");
      }
      console.log("data senidng");

      const result = await this.userUseCase.AllOrders(
        role == Roles.ADMIN ? "all" : _id,
        Number(page),
        Number(limit)
      );
      console.log(result, "orders is ");

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched successfully",
        result,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);

        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.message || "Unable to fetch ",
        });
      }
    }
  }
  async Coursecetrificate(req: AuthServices, res: Response) {
    try {
      const { courseId } = req.params;
      const { _id, name } = req.user;
      if (!_id || !courseId) {
        throw new Error("Please shere valid information");
      }
      const result = await this.userUseCase.certificate(_id, courseId);
      if (!result.completed) {
        throw new Error("please Compleate course");
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Succesfuly varified",
        data: {
          ...result,
          name,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.message || "some error occured",
        });
      }
    }
  }
  async reOrder(req: AuthServices, res: Response) {
    const { _id } = req.user;
    const { orderid } = req.params;
    console.log(orderid, "oid is ");

    if (!_id) {
      throw new Error("User not found");
    }
    if (!orderid) {
      throw new Error("Order not found");
    }
    const data = await this.CourseUseCase.repayOrder(_id, orderid);
    if (!data.sessionId) {
      throw new Error("cannot get the order");
    }
    const session = await this.stripe.checkout.sessions.retrieve(
      data.sessionId
    );
    console.log(session);

    res.status(200).json({
      success: true,
      message: "created",
      url: session.url,
      id: session.id,
    });
  }
  async getTotalRevenue(req: AuthServices, res: Response) {
    try {
      // if (req.user.role !== Roles.ADMIN) {
      //   throw new Error(userError.Unauthorised);
      // }
      const totalRevenue = await this.revenueUseCase.getTotalRevenue();
      res.status(200).json({ totalRevenue });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch total revenue",
        error: error instanceof Error ? error.message : "An Error ",
      });
    }
  }

  async getMentorRevenue(req: AuthServices, res: Response) {
    try {
      // if (req.user.role !== Roles.ADMIN) {
      //   throw new Error(userError.Unauthorised);
      // }
      const mentorRevenue = await this.revenueUseCase.getMentorRevenue();
      res.status(200).json({ mentorRevenue });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch mentor revenue",
        error: error instanceof Error ? error.message : "An Error ",
      });
    }
  }

  async getTimeRevenue(req: AuthServices, res: Response) {
    try {
      // if (req.user.role !== Roles.ADMIN) {
      //   throw new Error(userError.Unauthorised);
      // }
      const { period } = req.query;
      const timeRevenue = await this.revenueUseCase.getTimeRevenue(
        typeof period == "string"
          ? (period as "daily" | "weekly" | "monthly")
          : "monthly"
      );
      res.status(200).json({ timeRevenue });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch time-based revenue",
        error: error instanceof Error ? error.message : "An Error ",
      });
    }
  }

  async getMentorRevenueById(req: AuthServices, res: Response) {
    try {
      const { mentorId } = req.params;
      // && req.user._id !== mentorId
      if (req.user.role !== Roles.ADMIN || req.user.role !== Roles.MENTOR) {
        throw new Error(userError.Unauthorised);
      }
      if (!mentorId) {
        return res.status(400).json({ message: "Mentor ID is required" });
      }

      const revenue = await this.revenueUseCase.getMentorRevenueById(mentorId);
      res.status(200).json(revenue);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch mentor revenue",
        error: error instanceof Error ? error.message : "An Error ",
      });
    }
  }

  async getMentorTimeRevenue(req: AuthServices, res: Response) {
    try {
      const { mentorId } = req.params;
      const { period = "monthly" } = req.query;

      if (!mentorId) {
        return res.status(400).json({ message: "Mentor ID is required" });
      }

      const revenue = await this.revenueUseCase.getMentorTimeRevenue(
        mentorId,
        typeof period == "string"
          ? (period as "daily" | "weekly" | "monthly")
          : "monthly"
      );
      res.status(200).json({ timeRevenue: revenue });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch mentor time-based revenue",
        error: error instanceof Error ? error.message : "An Error ",
      });
    }
  }
}
