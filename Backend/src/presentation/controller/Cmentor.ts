import { Router, Request, Response, json } from "express";
import { z } from "zod";
import { MentorUsecase } from "../../app/useCases/mentor";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { Types } from "mongoose";
import { AuthServices } from "./user";
import { Roles, userError } from "../../app/useCases/enum/User";
import { CourseSchema } from "../../app/dtos/coursesDto";
import IUserReposetory from "../../domain/repository/IUser";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import { UserUsecase } from "../../app/useCases/User";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import IsocketUsecase from "../../domain/interface/socket";
import MeetingUsecase from "../../app/useCases/MeetingUsecase";

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
    console.log(data);
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "all categorys fetched success",
      data: data,
    });
    return;
  }
  async createCourses(req: AuthServices, res: Response) {
    try {
      console.log("data from frond", req.body);

      // if (req.user.role !== Roles.MENTOR) {
      //   console.log("no");
      //   return;
      // }
      const Coursdata = req.body.data;
      console.log("yses", Coursdata);
      console.log(req.user);
      const userid = await this.MentoruseCases.findUserid(req.user.email);
      console.log(userid?._id);

      Coursdata["Mentor_id"] = String(userid?._id);
      console.log(Coursdata);
      const aldredy = await this.MentoruseCases.getCourseByName(
        Coursdata.Title,
        String(userid?._id)
      );
      console.log(aldredy);

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
          console.log("erros in ", validation.error.formErrors);
          res
            .status(HttpStatusCode.BAD_REQUEST)
            .json({ success: false, error: validation.error.formErrors });
        }
        console.log(Coursdata.lessons, "leson issdfsfdf");

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
      console.log("error in catch", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
      return;
    }
  }
  async getCourses(req: AuthServices, res: Response) {
    // if (req.user.role !== Roles.MENTOR) {
    //   res
    //     .status(HttpStatusCode.UNAUTHORIZED)
    //     .json({ success: false, message: userError.Unauthorised });
    //   return;
    // }
    const userid = await this.userUsecase.UseProfileByemail(req.user.email);
    console.log(userid);

    if (!userid || !userid._id) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ success: false, message: userError.Unauthorised });
      return;
    }
    let data = await this.MentoruseCases.getallCourses(userid._id, req.query);
    console.log("all course of this user", data[0]);
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
    // if (req.user.role !== Roles.MENTOR && req.user.role !== Roles.ADMIN) {
    //   res.status(HttpStatusCode.UNAUTHORIZED).json({
    //     success: false,
    //     message: userError.Unauthorised,
    //   });
    //   return;
    // }
    console.log(req.body, "dara from frn");

    const datas = await this.MentoruseCases.getLesson(req.body.lessonid);
    console.log(JSON.stringify(datas), "datasississss");

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: "data fetched",
      data: datas,
    });
    return;
  }
  async applayAction(req: AuthServices, res: Response) {
    if (req.user.role !== Roles.ADMIN) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: userError.Unauthorised,
      });
      return;
    }
    const id = req.params.id;
    const action = req.body.action;
    await this.MentoruseCases.actionCourse(id, action);
    res.status(200).json({
      success: true,
      message: "Action completed",
    });
    return;
  }
  async VarifyUser(
    email: string,
    courseId: string,
    lessonid?: string,
    islesson: boolean = true,
    taskId?: string,
    isCourseDelete: boolean = true
  ) {
    const user = await this.userUsecase.UseProfileByemail(email);
    if (!user) {
      throw new Error("User not found");
    }
    console.log(email, courseId, lessonid, "datais");

    // Fetch course
    const course = await this.CourseUsecase.getSelectedCourse(courseId, false);
    console.log(course, "in varify");
    if (!course) {
      throw new Error("Course not found");
    }
    console.log(
      course.Mentor_id._id,
      "memtorid s",
      course.Mentor_id,
      course.Mentor_id.mentorId
    );
    if (String(course.Mentor_id.mentorId) !== String(user._id)) {
      throw new Error("You don't have permission");
    }
    if (course.Approved_by_admin == "approved" && isCourseDelete) {
      throw new Error("Cannot update approved Course");
    }
    console.log(course.lessons, "lessonid isissisi");
    console.log(
      lessonid,
      islesson,
      course.lessons.findIndex((data: any) => String(data._id) == lessonid),
      "lesson idatas"
    );
    const ans = course.lessons.findIndex(
      (data: any) => String(data._id) == lessonid
    );

    if (lessonid && islesson && ans == -1) {
      throw new Error("You don't have permission");
    }

    console.log(islesson, taskId, "is not ");
    if (!islesson) {
      if (!taskId) {
        throw new Error("task not found");
      }
      if (!lessonid) {
        throw new Error("lesson not found");
      }
      const lessons = await this.CourseUsecase.getLesson(lessonid);
      if (!lessons || !lessons.Task?.includes(taskId)) {
        throw new Error("Unauthorized Task");
      }
    }
    return { user, course };
  }
  async addTask(req: AuthServices, res: Response) {
    try {
      const { lessonid } = req.params;
      const { Taskdata, courseId } = req.body;
      const { email } = req.user;

      // Ensure required data exists
      if (!lessonid || !Taskdata || !courseId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Missing required fields",
        });
        return;
      }
      const { user, course } = await this.VarifyUser(email, courseId, lessonid);
      // Fetch user profile

      console.log(String(course.Mentor_id.name), String(user.name));

      // Check mentor permission

      // Add task
      await this.CourseUsecase.createTaskandaddtoLesson(Taskdata, lessonid);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Task added successfully",
      });
      return;
    } catch (error) {
      console.error("Error adding task:", error);
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
      const { course, user } = await this.VarifyUser(
        email,
        courseid,
        lessonid,
        false,
        taskid
      );
      console.log(user);
      console.log(data);
      const updatedData = await this.CourseUsecase.updateTaskinRepo(
        data,
        taskid
      );
      console.log(updatedData, "upded datais ");
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }

    // this.CourseUsecase.updateTaskinRepo();
  }
  async updateCoursecontroler(req: AuthServices, res: Response) {
    try {
      // if (req.user.role != Roles.MENTOR) {
      //   res.status(HttpStatusCode.UNAUTHORIZED).json({
      //     success: false,
      //     message: userError.Unauthorised,
      //   });
      //   return;
      // }
      const { courseid } = req.params;
      const { data } = req.body;
      const { _id, email } = req.user;
      if (data.lessons) {
        delete data.lessons;
      }
      console.log(data, courseid);
      const { course } = await this.VarifyUser(email, courseid);
      const different =
        new Date().getDate() - new Date(course.CreatedAt).getDate();
      console.log(different, "diffrent is ");

      await this.MentoruseCases.updataCourse(courseid, data);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "updated Successfull",
      });
      return;
    } catch (error) {
      console.log(error instanceof Error ? error.message : "loooo", "eror is");

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : "Unable to update",
      });
    }
  }
  async deleteLesson(req: AuthServices, res: Response) {
    try {
      if (req.user.role != Roles.MENTOR) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: userError.Unauthorised,
        });
        return;
      }
      const { email } = req.user;
      const { id } = req.params;
      const lessonid = req.body.lessonId;
      console.log(lessonid, id, "the id is htis ");

      await this.VarifyUser(email, id, lessonid);
      // const data = await this.MentoruseCases.FindCourse(id);
      // const removedArray = data?.lessons.filter((data) => data !== lessonid);
      await this.MentoruseCases.DeleteLesson(lessonid);
      await this.CourseUsecase.deleteLessonfromcourse(id, lessonid);
    } catch (error) {
      console.log(
        error instanceof Error
          ? error.message + "cannot seeeeeee"
          : "an error occured"
      );
    }
  }
  async UpdateAndAddNewlesson(req: AuthServices, res: Response) {
    const { email, role } = req.user;
    if (role !== Roles.MENTOR) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: userError.Unauthorised,
      });
    }
    const { lessondata } = req.body;
    const id = this.CourseUsecase.addlessons(lessondata);
    // this.CourseUsecase.
  }
  async updataLesson(req: AuthServices, res: Response): Promise<void> {
    try {
      const { email, role } = req.user;
      // if (role !== Roles.MENTOR) {
      //   res.status(HttpStatusCode.UNAUTHORIZED).json({
      //     success: false,
      //     message: userError.Unauthorised,
      //   });
      // }
      const { lessonid } = req.params;
      const { data, courseId } = req.body;
      await this.VarifyUser(email, courseId, lessonid);
      if (data.Task) {
        delete data.Task;
      }

      await this.CourseUsecase.updateLesson(lessonid, data);
      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error: any) {
      console.error("Error adding Course:", error.message);
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
      // if (role !== Roles.MENTOR) {
      //   res.status(HttpStatusCode.UNAUTHORIZED).json({
      //     success: false,
      //     message: userError.Unauthorised,
      //   });
      // }
      const { data, courseId } = req.body;
      await this.VarifyUser(email, courseId);
      console.log(data, courseId, "idis sdfas");

      const lessonId = await this.CourseUsecase.addlessons([data]);
      console.log(lessonId, courseId);

      await this.CourseUsecase.addLessoninCourse(courseId, String(lessonId));
      res.status(HttpStatusCode.OK).json({
        success: true,
      });
      return;
    } catch (error: any) {
      console.error("Error adding Lesson:", error.message);
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
      const { course } = await this.VarifyUser(email, courseid);
      course.lessons.forEach(async (id: string) => {
        if (id) {
          await this.MentoruseCases.DeleteLesson(id);
          console.log("deletd one lesson");
        }
      });
      await this.CourseUsecase.deleteCourse(courseid);
      console.log("course deleted");
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

      await this.VarifyUser(email, courseId, lessonid, false, taskid);

      // Delete the task
      await this.CourseUsecase.deletedtask(taskid, lessonid);
      console.log("uescompleted");

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

      // console.log(!user );
      console.log(!user, !user?._id, !course, !course?.Mentor_id);

      if (!user || !user._id || !course || course.data || !course.Mentor_id) {
        console.log("in jere");

        throw new Error("user not fount");
      }
      let roomid;
      const isaldredy = await this.SocketuserCase.findByusers({
        userid: user._id,
        mentorid: course.Mentor_id._id,
      });
      console.log(course, "cours id ", course.Mentor_id._id, course.Mentor_id);

      if (isaldredy) {
        roomid = String(isaldredy._id);
      } else {
        roomid = await this.SocketuserCase.StartMessage(
          course.Mentor_id.mentorId,
          user._id,
          courseid
        );
      }
      console.log(isaldredy, "aldredy exsist");
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "room created successfully",
        roomid: roomid,
      });
    } catch (error: any) {
      console.log(error);

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
    console.log(data);
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
      // if (users.role !== Roles.MENTOR) {
      //   throw new Error(userError.Unauthorised);
      // }
      if (!page) {
        throw new Error("no pages found");
      }
      const data = await this.userUsecase.fetchAllUsers(req.query, users._id);
      console.log(data);
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
      if (role !== Roles.MENTOR) {
        throw new Error(userError.Unauthorised);
      }

      const { page, limit } = req.query;
      console.log(limit);
      const data = await this.MentoruseCases.getOrderBymentor(
        _id,
        Number(page),
        Number(limit)
      );
      console.log(data, "order By mentor");
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
      console.log(data, "stateis ");

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
      console.log(data, "upstatus");
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
      console.log("entere fadfsd");

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
      console.log("data is ", result);
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
      const { course } = await this.VarifyUser(
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
      console.log(error, "error is ");
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : "Unable to update",
      });
      return;
    }
  }
}
