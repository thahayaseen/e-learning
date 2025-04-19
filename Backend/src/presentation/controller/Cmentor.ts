import { Router, Request, Response, json } from "express";
import { z } from "zod";
import { MentorUsecase } from "../../app/useCases/mentor";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { Types } from "mongoose";
import { AuthServices } from "./user";
import { Roles, userError } from "../../app/useCases/enum/User";
import { CourseSchema } from "../../app/dtos/coursesDto";
import IUserReposetory from "../../domain/repository/IUser.repository";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import { UserUsecase } from "../../app/useCases/User";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import IsocketUsecase from "../../domain/interface/socket";
import MeetingUsecase from "../../app/useCases/MeetingUsecase";
import { courseMiddleweres } from "../service/controler.config";

export class MentorController {
  constructor(
    private MentoruseCases: MentorUsecase,
    private userUsecase: UserUsecase,
    private CourseUsecase: ICourseUseCase,
    private SocketuserCase: IsocketUsecase,
    private MeetUsecase: MeetingUsecase
  ) {}
  async getcategorys(req: Request, res: Response) {
    const data = await this.MentoruseCases.getallCategory();
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "all categorys fetched success",
      data: data,
    });
    return;
  }
  async createCourses(req: AuthServices, res: Response) {
    try {
      const Coursdata = req.body.data;
      const userid = await this.MentoruseCases.findUserid(req.user.email);

      Coursdata["Mentor_id"] = String(userid?._id);
      const aldredy = await this.MentoruseCases.getCourseByName(
        Coursdata.Title,
        String(userid?._id)
      );

      if (aldredy.length !== 0) {
        res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: "Course Aldredy exsist",
        });
        return;
      }

      let results;
      if (Coursdata) {
        const validation = CourseSchema.safeParse(Coursdata);
        if (!validation.success) {
          res
            .status(HttpStatusCode.BAD_REQUEST)
            .json({ success: false, error: validation.error.formErrors });
        }

        const ids = await this.CourseUsecase.addlessons(Coursdata.lessons);
        Coursdata.lessons = ids;

        results = await this.CourseUsecase.createCourse(Coursdata);
      }
      res.status(HttpStatusCode.CREATED).json({
        success: true,
        results,
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
      return;
    }
  }
  async getCourses(req: AuthServices, res: Response) {
    const userid = await this.userUsecase.UseProfileByemail(req.user.email);
    if (!userid || !userid._id) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: userError.Unauthorised });
      return;
    }
    let data = await this.MentoruseCases.getallCourses(userid._id, req.query);
    data = data[0];
    data.total = data?.total[0]?.count || data.total;
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "fetched success",
      data: data,
    });
    return;
  }
  async controlergetLesson(req: AuthServices, res: Response) {
    const datas = await this.MentoruseCases.getLesson(req.body.lessonid);
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "data fetched",
      data: datas,
    });
    return;
  }
  async applayAction(req: AuthServices, res: Response) {
    const id = req.params.id;
    const action = req.body.action;
    await this.MentoruseCases.actionCourse(id, action);
    res.status(200).json({
      success: true,
      message: "Action completed",
    });
    return;
  }

  async startChat(req: AuthServices, res: Response) {
    try {
      const { email } = req.user;
      const { courseid } = req.body;
      const user = await this.userUsecase.UseProfileByemail(email);
      const course = await this.CourseUsecase.getSelectedCourse(
        courseid,
        false
      );
      if (!user || !user._id || !course || course.data || !course.Mentor_id) {
        console.log("in jere");

        throw new Error("user not fount");
      }
      let roomid;
      const isaldredy = await this.SocketuserCase.findByusers({
        userid: user._id,
        mentorid: course.Mentor_id.mentorId,
      });
      if (isaldredy) {
        roomid = String(isaldredy._id);
      } else {
        roomid = await this.SocketuserCase.StartMessage(
          course.Mentor_id.mentorId,
          user._id,
          courseid
        );
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "room created successfully",
        roomid: roomid,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
  async getRoomsByid(req: AuthServices, res: Response) {
    const { email, _id, role } = req.user;
    const page = Number(req.query.page) || 1;
    const data = await this.SocketuserCase.getAllroomsByid(_id, page);
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "Data fetched successfully",
      data,
    });
  }
  async studentManagment(req: AuthServices, res: Response) {
    try {
      const { page } = req.query;
      const users = req.user;
      if (!page) {
        throw new Error("no pages found");
      }
      const data = await this.userUsecase.fetchAllUsers(req.query, users._id);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched successfully",
        data: data.data,
        total: data.total,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || "please Make sure all arguments",
      });
      return;
    }
  }
  async getorderMentorId(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const { page, limit } = req.query;
      const data = await this.MentoruseCases.getOrderBymentor(
        _id,
        Number(page),
        Number(limit)
      );
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Successfully fetch data",
        data,
      });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "an Unexptected Error fetchign data",
      });
    }
  }
  async getState(req: AuthServices, res: Response) {
    try {
      const { _id, role } = req.user;
      const data = await this.MentoruseCases.getState(_id);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "successfully ",
        data,
      });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : "cannto get state",
      });
    }
  }
  async getRevenue(req: AuthServices, res: Response) {
    try {
      const { _id, role } = req.user;
      const data = await this.MentoruseCases.getRevenueData(_id);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "successfully ",
        data,
      });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : "cannto get state",
      });
    }
  }
  async updateMeetingStatus(req: AuthServices, res: Response) {
    try {
      const { _id, role } = req.user;
      const { status } = req.query;
      const { meetid } = req.params;
      const validStatuses = [
        "approved",
        "rejected",
        "canceled",
        "pending",
        "completed",
      ] as const;
      if (
        typeof status !== "string" ||
        !validStatuses.includes(status as any)
      ) {
        throw new Error("Does Not match status");
      }
      const typedStatus = status as (typeof validStatuses)[number];
      const data = await this.MeetUsecase.updateSatus(
        String(meetid),
        typedStatus,
        _id
      );
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "updated Success",
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to update Data",
      });
    }
  }
  async getMeetings(req: AuthServices, res: Response) {
    try {
      const { _id } = req.user;
      const { page, limit, search, status } = req.query;
      let filter = {
        search,
        status,
      };
      const result = await this.MeetUsecase.fetchallMeetsBymentorid(
        _id,
        Number(page),
        Number(limit),
        filter
      );
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched success",
        result,
      });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Cannot find the Data",
      });
    }
  }
}
