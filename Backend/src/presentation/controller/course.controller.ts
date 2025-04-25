import { userUseCase } from "./../../config/dependencies";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import { IMeetusecase } from "../../domain/interface/ImessageUsecase";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { AuthServices } from "./user.controller";
import { Request, Response } from "express";
import { ILogin } from "../../domain/interface/Ilogin";
import { Roles, userError } from "../../app/useCases/enum/User";
import { SystemError } from "../../app/useCases/enum/systemError";
import { orderDto } from "../../app/dtos/orderDto";
import { CourseSchema } from "../../app/dtos/coursesDto";
import { MentorUsecase } from "../../app/useCases/mentor.usecase";

export class courseControllerClass {
  constructor(
    private CourseUseCase: ICourseUseCase,
    private MeetingUsecase: IMeetusecase,
    private userUseCase: IuserUseCase,
    private LoginUsecase: ILogin,
    private MentoruseCases: MentorUsecase
  ) {}
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
 

      const meetid = await this.MeetingUsecase.getMeetByuserid(_id, courseid);
 

      const user = await this.userUseCase.UseProfileByemail(req.user.email);
      const isvalid = user?.purchasedCourses?.includes(courseid);
 
      if (isvalid == undefined) return;

      const reslt = await this.CourseUseCase.getSelectedCourse(
        courseid,
        isvalid,
        _id
      );
 
      if (!reslt.progress) {
        delete reslt.progress;
      }
 

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

  async getQustionans(req: AuthServices, res: Response) {
    try {
      const { taskid } = req.params;
      const { answer } = req.body;
      const data = await this.CourseUseCase.getTaskByid(taskid);
 
 

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
  async orders(req: AuthServices, res: Response) {
    try {
      const { page, limit } = req.query;
      const { _id, role } = req.user;
 
      if (!_id || !page || !limit) {
        throw new Error("Please send valid data");
      }
 

      const result = await this.userUseCase.AllOrders(
        role == Roles.ADMIN ? "all" : _id,
        Number(page),
        Number(limit)
      );
 

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "fetched successfully",
        result,
      });
    } catch (error) {
      if (error instanceof Error) {
 

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
 

      const result = await this.CourseUseCase.certificate(_id, courseId);
      if (!result) {
        throw new Error("please Compleate course");
      }
 

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Succesfuly varified",

        result,
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
  async createCourses(req: AuthServices, res: Response) {
    try {
 

      const Coursdata = req.body.data;
 
 
      const userid = await this.MentoruseCases.findUserid(req.user.email);
 

      Coursdata["Mentor_id"] = String(userid?._id);
 
      const aldredy = await this.CourseUseCase.getCourseByName(
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
 

        const ids = await this.CourseUseCase.addlessons(Coursdata.lessons);
        Coursdata.lessons = ids;

        results = await this.CourseUseCase.createCourse(Coursdata);
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
    const userid = await this.userUseCase.UseProfileByemail(req.user.email);
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
  async getAllCertificate(req: AuthServices, res: Response) {
    try {
      const id = req.user._id;
      const { page, limit, search } = req.query;
 

      const data = await this.CourseUseCase.getAllCertificate(
        id,
        Number(page),
        Number(limit),
        search
      );
 

      res.status(HttpStatusCode.OK).json({
        success: false,
        message: "successfully fetch",
        data: data.data,
        total: data.total,
      });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : "An error occured",
      });
    }
  }
}
