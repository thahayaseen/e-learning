import { Router, Request, Response, json } from "express";
import { z } from "zod";
import { MentorUsecase } from "../../app/useCases/mentor.usecase";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { Types } from "mongoose";
import { AuthServices } from "./user.controller";
import { Roles, userError } from "../../app/useCases/enum/User";
import { CourseSchema } from "../../app/dtos/coursesDto";
import IUserReposetory from "../../domain/repository/IUser.repository";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import { UserUsecase } from "../../app/useCases/User.usecase";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import IsocketUsecase from "../../domain/interface/socket";
import MeetingUsecase from "../../app/useCases/Meeting.usecase";
import { Middlewares, userServisess } from "../../config/dependencies";
import RevenueUseCase from "../../app/useCases/revenue.usecase";
import { SystemError } from "../../app/useCases/enum/systemError";
import { ILesson } from "../../infra/database/models/lessone";

export class MentorController {
  constructor(
    private MentoruseCases: MentorUsecase,
    private userUsecase: UserUsecase,
    private CourseUsecase: CourseUsecase,
    private SocketuserCase: IsocketUsecase,
    private MeetUsecase: MeetingUsecase,
    private revenueUseCase: RevenueUseCase
  ) {}
  async getcategorys(req: Request, res: Response) {
    const { page, limit, search } = req.query;
    const data = await this.MentoruseCases.getallCategory({
      page: typeof page == "string" ? Number(page) : 1,
      limit: typeof limit == "string" ? Number(limit) : 10,
      search: typeof search == "string" ? search : "",
    });
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "all categorys fetched success",
      data: data.data,
      total: data.total,
    });
    return;
  }
  async applayAction(req: AuthServices, res: Response) {
    const id = req.params.id;
    const action = req.body.action;
    await this.CourseUsecase.actionCourse(id, action);
    res.status(200).json({
      success: true,
      message: "Action completed",
    });
    return;
  }

  async addTask(req: AuthServices, res: Response) {
    try {
      const { lessonid } = req.params;
      const { Taskdata, courseId } = req.body;
      const { email } = req.user;
      console.log(Taskdata);

      // Ensure required data exists
      if (!lessonid || !Taskdata || !courseId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Missing required fields",
        });
        return;
      }
      const { user, course } = await userServisess.verify(
        email,
        courseId,
        lessonid
      );
      // Fetch user profile
      // Add task
      await this.CourseUsecase.createTaskandaddtoLesson(Taskdata, lessonid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Task added successfully",
      });
      return;
    } catch (error) {
      console.log(error, "error is");

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
      return;
    }
  }
  async updateTask(req: AuthServices, res: Response) {
    try {
      const { data, courseid, lessonid } = req.body;
      const { taskid } = req.params;
      const { email } = req.user;
      const { course, user } = await userServisess.verify(
        email,
        courseid,
        lessonid,
        false,
        taskid
      );
      const updatedData = await this.CourseUsecase.updateTaskinRepo(
        data,
        taskid
      );
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }
  }
  async updateCoursecontroler(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.params;
      const { data } = req.body;
      const { _id, email } = req.user;
      if (data.lessons) {
        delete data.lessons;
      }
      const { course } = await userServisess.verify(email, courseid);

      await this.CourseUsecase.updataCourse(courseid, data, _id);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "updated Successfull",
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : "Unable to update",
      });
    }
  }
  async deleteLesson(req: AuthServices, res: Response) {
    try {
      const { email } = req.user;
      const { id } = req.params;
      const lessonid = req.body.lessonId;
      await userServisess.verify(email, id, lessonid);
      await this.CourseUsecase.DeleteLesson(lessonid);
      await this.CourseUsecase.deleteLessonfromcourse(id, lessonid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "deleted success",
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message:
          error instanceof Error ? error.message : SystemError.SystemError,
      });
    }
  }
  async updataLesson(req: AuthServices, res: Response): Promise<void> {
    try {
      const { email } = req.user;
      const { lessonid } = req.params;
      const { data, courseId } = req.body;
      await userServisess.verify(email, courseId, lessonid);
      if (data.Task) {
        delete data.Task;
      }
      await this.CourseUsecase.updateLesson(lessonid, data);
      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }
  }
  async addlesson(req: AuthServices, res: Response) {
    try {
      const { email, role } = req.user;
      const { data, courseId } = req.body;
      await userServisess.verify(email, courseId);
      const getCourse = await this.CourseUsecase.getSelectedCourse(
        courseId,
        false
      );
      console.log(getCourse.lessons, "test tje cpirse data", data);
      getCourse.lessons.forEach((datas: any) => {
        console.log(
          datas.Lessone_name,
          data.Lessone_name,
          "ress is",
          datas.Lessone_name == data.Lessone_name
        );

        if (datas.Lessone_name == data.Lessone_name) {
          throw new Error("Lesson aldredy exsist");
        }
      });
      const lessonId = await this.CourseUsecase.addlessons([data]);
      await this.CourseUsecase.addLessoninCourse(courseId, String(lessonId));
      res.status(HttpStatusCode.OK).json({
        success: true,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }
  }
  async deleteCourse(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.body;
      const { email } = req.user;
      const { course } = await userServisess.verify(email, courseid);
      course.lessons.forEach(async (id: string) => {
        if (id) {
          await this.CourseUsecase.DeleteLesson(id);
        }
      });
      await this.CourseUsecase.deleteCourse(courseid);
      res
        .status(HttpStatusCode.OK)
        .json({ success: true, message: "succes fully deleted" });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
  async DeleteTask(req: AuthServices, res: Response) {
    try {
      const { taskid, lessonid, courseId } = req.body;
      const { email } = req.user;
      if (!taskid || !lessonid) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Missing required fields",
        });
        return;
      }
      await userServisess.verify(email, courseId, lessonid, false, taskid);
      await this.CourseUsecase.deletedtask(taskid, lessonid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Task deleted successfully",
      });
      return;
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }
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
      const { _id, role } = req.user;
      const { page, limit } = req.query;
      const data = await this.CourseUsecase.getOrderBymentor(
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
      const { _id, role } = req.user;
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
  async ListactionCourse(req: AuthServices, res: Response) {
    try {
      const { courseid } = req.query;
      const { email } = req.user;
      if (!courseid) {
        throw new Error("cannot get all data");
      }
      const { course } = await userServisess.verify(
        email,
        String(courseid),
        undefined,
        undefined,
        undefined,
        false
      );
      await this.CourseUsecase.actionCourse(String(courseid), !course.unlist);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "updated",
      });
      return;
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : "Unable to update",
      });
      return;
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
  async getTotalRevenue(req: AuthServices, res: Response) {
    try {
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
}
