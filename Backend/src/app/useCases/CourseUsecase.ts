import mongoose, { FilterQuery, ObjectId, Types } from "mongoose";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import { ICoursesRepository } from "../../domain/repository/Icourses.repository";
import { IReviewRepo } from "../../domain/repository/IReview.repositroy";
import IUserReposetory from "../../domain/repository/IUser.repository";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import {
  ILessonProgress,
  IProgressCollection,
  ITaskProgress,
} from "../../infra/database/models/progress";
import { IReview } from "../../infra/database/models/reiview";
import { IQuizTask, ITask } from "../../infra/database/models/tasks";
import {
  ICourseFilter,
  IPaginationResult,
} from "../../infra/repositories/courses.repository";
import { orderDto } from "../dtos/orderDto";
import { ICertificaterepository } from "../../domain/repository/Icertificate.repository";
import { CertificateDTO } from "../dtos/Certificate";
import { ICategory } from "../../infra/database/models/Category";
export class CourseUsecase implements ICourseUseCase {
  constructor(
    private userRepo: IUserReposetory,
    private CourseRepo: ICoursesRepository,
    private ReviewRepo: IReviewRepo,
    private CertificateRepo: ICertificaterepository
  ) {}
  async getAllCourse(
    page: number,
    limit: number,
    sort: { field?: string; order?: "asc" | "desc" },
    filter: ICourseFilter = {}
  ): Promise<IPaginationResult<ICourses>> {
    return await this.CourseRepo.getCourseUser(page, limit, sort, filter);
  }
  async getSelectedCourse(
    id: string,
    isValid: boolean,
    userid?: string
  ): Promise<{ data: ICourses; progress?: IProgressCollection } > {
    try {
      let progress = null;

      const data = await this.CourseRepo.getSingleCourse(id, isValid);
      if (!data) {
        throw new Error("cannot find the course");
      }
      if (userid && data&&isValid) {
        console.log('yes here');
        
        const resu = await this.CourseRepo.getSelectedcourseprogress(
          userid,id
          
        );
        if (!resu) {
          throw new Error("Cannot find progress");
        }
        return {
          data,
          progress: resu,
        };
      }
      return {data:data};
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "An error while taking course"
      );
    }
  }
  async purchaseCourse(userId: string, courseId: string) {
    try {
      await this.CourseRepo.AddStudentInCourse(courseId, userId);
      await this.userRepo.addCourseInstudent(userId, courseId);
      await this.CourseRepo.FindSelectedCourse(courseId);
      await this.createProgress(courseId, userId);
      return;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error while purchase Course"
      );
    }
  }
  async getByCoursidByUserid(
    CourseId: string[],
    userid: string,
    page?: number,
    limit?: number
  ) {
    return await this.CourseRepo.getCouseEachuser(
      CourseId,
      userid,
      page,
      limit
    );
  }
  async createCourseUseCase(datas: Omit<ICourses, "_id">) {
    return await this.CourseRepo.createCourse(datas);
  }
  async addlessons(datas: ILesson[]): Promise<Types.ObjectId[]> {
    const datiii = await Promise.all(
      datas.map(async (dat) => {
        if (!dat.Task) {
          dat.Task = [];
        }
        const tasks = await this.CourseRepo.createTask(dat.Task);

        // dat.Task["Lesson_id"] = tasks._id;
        const ans = await this.CourseRepo.createLesson({
          Lessone_name: dat.Lessone_name,
          Content: dat.Content,
          Task: tasks,
        });

        return ans._id;
      })
    );

    // datas = datiii;
    return datiii;
  }
  async createTaskandaddtoLesson(
    data: ITask,
    lessonId: string
  ): Promise<ILesson | null> {
    const idis = await this.CourseRepo.createTask([data]);

    const addtoLesosn = await this.CourseRepo.updateLesson(lessonId, {
      utask: idis,
    });

    return addtoLesosn;
  }
  async updateLesson(
    lessonid: string,
    data: Omit<ILesson, "Task">
  ): Promise<ILesson | null> {
    const datas = await this.CourseRepo.updateLesson(lessonid, data);
    return datas;
  }
  async updateTaskinRepo(data: ITask, taskId: string): Promise<ITask | null> {
    return await this.CourseRepo.UpdateTask(taskId, data);
  }
  async getLessonByid(lessonid: string): Promise<ILesson | null> {
    return this.CourseRepo.FindLessonByid(new Types.ObjectId(lessonid));
  }
  async addLessoninCourse(courseId: string, lessonid: string): Promise<void> {
    return await this.CourseRepo.UpdataCourse(courseId, {
      $push: { lessons: lessonid },
    });
  }
  async deleteCourse(courseid: string): Promise<void> {
    await this.CourseRepo.deleteCourse(courseid);

    return;
  }
  async deletedtask(taskid: string, lessonid: string): Promise<void> {
    await this.CourseRepo.DeleteTaskFromLesson(lessonid, taskid);
    await this.CourseRepo.deleteTask(new Types.ObjectId(taskid));
    return;
  }
  async deleteLessonfromcourse(
    courseId: string,
    lessonid: string
  ): Promise<void> {
    await this.CourseRepo.DeleteLessonFromCourse(courseId, lessonid);
  }
  async getuserallCourseprogresdata(userid: string): Promise<{
    progresPersentage: number;
    coursesCount: number;
    completedCourse: number;
  }> {
    // Fetch all progress data for the user
    const progressData = await this.CourseRepo.getAllprogressByuserid(userid);

    let totalProgress = 0;
    let coursesCount = 0;
    let completedCourse = 0;

    // Iterate through each course progress
    progressData?.forEach((data) => {
      const score = Number(data.OverallScore);

      // Ensure the score is a valid number
      if (!isNaN(score)) {
        totalProgress += score;
        coursesCount++;

        // Check if the course is completed (score === 100)
        if (score === 100) {
          completedCourse++;
        }
      } else {
        console.warn(
          `Invalid score found for user ${userid}:`,
          data.OverallScore
        );
      }
    });

    // Calculate the average progress percentage
    const averageProgress =
      coursesCount > 0 ? Math.ceil(totalProgress / coursesCount) : 0;

    return {
      progresPersentage: averageProgress,
      coursesCount,
      completedCourse,
    };
  }
  async getTaskByid(taskid: string): Promise<ITask | IQuizTask | null> {
    return await this.CourseRepo.FindTask(taskid);
  }
  async createOrder(course: orderDto): Promise<orderDto> {
    return await this.CourseRepo.createOrder(course);
  }
  async updateOrder(updateData: orderDto, orderid: string): Promise<orderDto> {
    const data = await this.CourseRepo.updataOrder(orderid, updateData);
    if (!data) {
      throw new Error("Unable to update order");
    }
    return data;
  }
  async Conformpayment(
    updateData: orderDto,
    orderId: string
  ): Promise<orderDto> {
    const session = await mongoose.startSession(); // 1️⃣ Start session
    session.startTransaction(); // 2️⃣ Start transaction

    try {
      const data = await this.CourseRepo.updataOrder(
        orderId,
        updateData,
        session
      );

      if (!data) {
        throw new Error("Unable to update order");
      }

      await session.commitTransaction(); // 3️⃣ Commit transaction
      return data;
    } catch (error) {
      await session.abortTransaction(); // ❌ Rollback transaction on error
      throw new Error(
        `Payment confirmation failed: ${
          error instanceof Error ? error.message : "an Error eccoured"
        }`
      );
    } finally {
      session.endSession(); // 🛑 End session
    }
  }

  async createProgress(courseid: string, userid: string) {
    // Fetch the course with populated lessons and tasks
    try {
      const course = await this.CourseRepo.FindSelectedCourse(courseid);

      if (!course) {
        throw new Error("Course not found");
      }

      // Initialize an array to hold lesson progress
      const lessonProgress: ILessonProgress[] = [];

      // Iterate through each lesson in the course
      course.lessons.forEach((lesson) => {
        // Initialize an array to hold task progress for the current lesson
        const taskProgress: ITaskProgress[] = [];

        // Iterate through each task in the lesson
        lesson.Task.forEach((task) => {
          let taskProgressItem: ITaskProgress |object = {};
          if (task.Type == "Video") {
            taskProgressItem = {
              Task_id: String(task._id), // Task ID
              userid: userid,
              Completed: false,
              Score: 0,
              WatchTime: 0,
              Status: "Not Started",
            };
          }
          if (task.Type == "Quiz") {
            taskProgressItem = {
              Task_id: String(task._id), // Task ID
              userid: userid,
              Completed: false,

              Status: "Not Started",
            };
          }
          if (task.Type == "Assignment") {
            taskProgressItem = {
              Task_id: String(task._id), // Task ID
              userid: userid,
              Completed: false,
              responce: "",
              Status: "Not Started",
            };
          }
          taskProgress.push(taskProgressItem as ITaskProgress);
          // }
        });

        // Create a lesson progress object for the current lesson
        const lessonProgressItem: ILessonProgress = {
          Lesson_id: lesson._id.toString(), // Lesson ID
          Completed: false, // Default to not completed
          WatchTime: 0, // Default watch time
          Task_progress: taskProgress, // Array of task progress
        };

        // Add the lesson progress to the array
        lessonProgress.push(lessonProgressItem);
      });

      await this.CourseRepo.createProgress(userid, courseid, lessonProgress);

      return;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "an Error occupied"
      );
    }
  }
  async updateTaskProgress(
    studentId: string,
    courseId: string,
    lessonId: string,
    taskId: string,
    taskType: string,
    updateData: {
      watchTime?: number;
      isCompleted?: boolean;
      response?: string;
      score?: number;
    }
  ): Promise<IProgressCollection> {
    const result = await this.CourseRepo.updateTaskProgress(
      studentId,
      courseId,
      lessonId,
      taskId,
      taskType,

      updateData
    );
    console.log(
      result,
      "result is sissisisisi",
      result.OverallScore,
      result.OverallScore == 100
    );
    if (result.OverallScore == 100) {
      let sertificate = await this.CertificateRepo.GetCertificateByCourseid(
        result.Student_id._id as Types.ObjectId,
        result.Course_id._id as Types.ObjectId
      );

      if (!sertificate) {
        sertificate = await this.CertificateRepo.createCertificate(
          result.Student_id._id as Types.ObjectId,
          result.Student_id.name,
          result.Course_id._id,
          String(result.Course_id.Title),
          (result.Course_id.Category as any).Category as string ,
          new Date()
        );
      }

      result.certificateId = String(sertificate?._id);
    }

    return result;
  }
  async markLessonCompleteduseCase(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<IProgressCollection> {
    return await this.CourseRepo.markLessonCompleted(
      studentId,
      courseId,
      lessonId
    );
  }
  async getSelectedProgress(
    courseid: string,
    userid: string
  ): Promise<IProgressCollection | null> {
    return await this.CourseRepo.getSelectedcourseprogress(userid, courseid);
  }
  async addRating(
    userid: string,
    courseid: string,
    rating: number,
    title: string,
    comment: string
  ): Promise<void> {
    await this.ReviewRepo.CreateReview(
      userid,
      courseid,
      rating,
      title,
      comment
    );
  }
  async getallReviews(courseid: string): Promise<IReview[]> {
    return await this.ReviewRepo.getReiview(courseid);
  }
  async checkOrderDupication(
    userid: string,
    courseid: string,
    type: boolean
  ): Promise<orderDto | null> {
    const data = await this.CourseRepo.getorderByuidandCourse(
      userid,
      courseid,
      type
    );
    if (data && type) {
      throw new Error("Payment is already in prossess");
    }
    return data;
  }
  async repayOrder(
    userid: string,
    orderid: string
  ): Promise<Partial<orderDto>> {
    return await this.CourseRepo.getOneorder(userid, orderid);
  }
  async certificate(userid: string, courseid: string): Promise<CertificateDTO|null> {
    const ddd = await this.CertificateRepo.GetCertificateByCourseid(
      new Types.ObjectId(userid),
      new Types.ObjectId(courseid)
    );

    return ddd;
  }
  async getAllCertificate(
    studentid: string,
    page: number = 1,
    limit: number = 10,
    search: string
  ): Promise<{ data: CertificateDTO[]; total: number }> {
    return await this.CertificateRepo.getAllcertificate(
      studentid,
      page,
      limit,
      search
    );
  }
  async actionCourse(coureseId: string, action: boolean): Promise<void> {
    await this.CourseRepo.UpdataCourse(String(coureseId), { unlist: action });
    return;
  }
  async getCourseByName(name: string, Mentor_id: string) {
    return await this.CourseRepo.getByname(name, Mentor_id);
  }
  async getallCourses(id: string, filter: FilterQuery<ICourses>): Promise<any> {
    const { page, limit, search, status, priceRange, sortBy } = filter;
    const skip = (page - 1) * limit;
    const match:FilterQuery<ICourses> = { Mentor_id: id };
    let sort: any = {};
    if (sortBy !== "all" && sortBy) {
      if (sortBy == "price-high") {
        sort.Price = -1;
      }
      if (sortBy == "price-low") {
        sort.Price = 1;
      }
      if (sortBy == "oldest") {
        sort.CreatedAt = 1;
      }
      if (sortBy == "newest") {
        sort.CreatedAt = -1;
      }
    }

    if (status !== "all" && status) {
      match["Approved_by_admin"] = status;
    }
    if (search) {
      match["$or"] = [
        { Title: { $regex: new RegExp(search, "i") } },
        { "Category.Category": { $regex: new RegExp("^" + search, "i") } },
      ];
    }
    const pipline = [
      {
        $lookup: {
          from: "categories",
          localField: "Category",
          foreignField: "_id",
          as: "Category",
        },
      },
      {
        $unwind: "$Category",
      },
      { $match: match },
      { $sort: sort },

      {
        $lookup: {
          from: "users",
          let: { mentorId: "$Mentor_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$mentorId"] } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: "Mentor_id",
        },
      },
      {
        $unwind: "$Mentor_id",
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: Number(limit) }],
        },
      },
    ];
    const data = await this.CourseRepo.getCourse(id, pipline);

    return data;
  }
  async getLesson(id: string) {
    const data = await this.CourseRepo.getLessons(id);

    return data?.lessons;
  }
  async updataCourse(courseId: string, data: any, mentorId: string) {
    const updated: any = {};
    for (let i in data) {
      const value = data[i];
      if (typeof value === "string") {
        if (value.trim() !== "") {
          updated[i] = value;
        }
      } else if (value !== null && value !== undefined) {
        updated[i] = value;
      }
    }
    if (updated["Title"]) {
      console.log("yessss", data);
      const aldredy = await this.getCourseByName(updated["Title"], mentorId);
      console.log(aldredy, "a;fre");

      if (aldredy.length !== 0) {
        throw new Error("The couse with same name aldredy exsist");
      }
    }
    await this.CourseRepo.UpdataCourse(courseId, updated);
  }

  async DeleteLesson(lesosnid: Types.ObjectId): Promise<any> {
    const categoryis = await this.CourseRepo.FindLessonByid(lesosnid);

    categoryis?.Task?.forEach(async (data) => {
      await this.CourseRepo.deleteTask(data._id as Types.ObjectId);
    });

    await this.CourseRepo.DeleteLessonByid(lesosnid);
  }
  async getOrderBymentor(
    mentorid: string,
    page: number,
    limit: number
  ): Promise<any> {
    return await this.CourseRepo.getOrdersByMentorId(mentorid, page, limit);
  }
}
