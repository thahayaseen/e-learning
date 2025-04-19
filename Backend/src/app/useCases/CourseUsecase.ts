import mongoose from "mongoose";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import { IReviewRepo } from "../../domain/repository/IReviewRepositroy";
import IUserReposetory from "../../domain/repository/IUser";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import {
  ILessonProgress,
  IProgressCollection,
  ITaskProgress,
} from "../../infra/database/models/progress";
import { IReview } from "../../infra/database/models/reiview";
import { IQuizTask, ITask } from "../../infra/database/models/tasks";
import { IPaginationResult } from "../../infra/repositories/RepositoryCourses";
import { CourseDTO } from "../dtos/coursesDto";
import { orderDto } from "../dtos/orderDto";
import { ICertificaterepository } from "../../domain/repository/Icertificate.repository";
import { CertificateDTO } from "../dtos/Certificate";

export class CourseUsecase implements ICourseUseCase {
  constructor(
    private userRepo: IUserReposetory,
    private CourseRepo: ICoursesRepository,
    private ReviewRepo: IReviewRepo,
    private CertificateRepo: ICertificaterepository
  ) {}
  async getCourseBymentor(id: string): Promise<ICourses | null> {
    return (await this.CourseRepo.getCourseBymentor(id))[0];
  }
  async getAllCourse(
    page: number,
    limit: number,
    sort: any,
    filter?: any
  ): Promise<IPaginationResult<any>> {
    return await this.CourseRepo.getCourseUser(page, limit, sort, filter);
  }
  async getSelectedCourse(
    id: string,
    isValid: boolean,
    userid?: string
  ): Promise<any> {
    try {
      let progress = null;
      console.log(id);

      const data = await this.CourseRepo.getSingleCourse(id, isValid);

      console.log(data, "in usecase");
      if (userid && data) {
        const resu = await this.CourseRepo.getSelectedcourseprogress(
          id,
          userid
        );
        return {
          data,
          progress: resu,
        };
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async purchaseCourse(userId: string, courseId: string) {
    try {
      await this.CourseRepo.AddStudentInCourse(courseId, userId);
      await this.userRepo.addCourseInstudent(userId, courseId);
      const courses = await this.CourseRepo.FindSelectedCourse(courseId);

      await this.createProgress(courseId, userId);

      return;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getByCoursids(
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
  async createCourse(datas: Omit<ICourses, "_id">) {
    console.log(datas, "lessson is");

    return await this.CourseRepo.createCourse(datas);
  }
  async addlessons(datas: ILesson[]): Promise<any> {
    console.log("in addlesson", datas);
    const datiii = await Promise.all(
      datas.map(async (dat: any) => {
        if (!dat.Task) {
          dat.Task = [];
        }
        const tasks = await this.CourseRepo.createTask(dat.Task);
        console.log(tasks, "in task creating ");

        dat.Task["Lesson_id"] = tasks._id;
        const ans = await this.CourseRepo.createLesson({
          Lessone_name: dat.Lessone_name,
          Content: dat.Content,
          Task: tasks,
        });
        console.log(tasks, "tasks id is ");

        console.log(dat, "fdsdfdadsnew");

        console.log(ans);
        return ans._id;
      })
    );

    console.log(datiii);
    datas = datiii;
    return datiii;
  }
  async createTaskandaddtoLesson(
    data: ITask,
    lessonId: string
  ): Promise<ILesson | null> {
    console.log(data);

    const idis = await this.CourseRepo.createTask([data]);
    console.log(idis, "in create Task");

    const addtoLesosn = await this.CourseRepo.updateLesson(lessonId, {
      utask: idis,
    });
    console.log(addtoLesosn, "in added lesson");

    return addtoLesosn;
  }
  async updateLesson(
    lessonid: string,
    data: Omit<ILesson, "Task">
  ): Promise<ILesson | null> {
    console.log(data, "in usecases");

    const datas = await this.CourseRepo.updateLesson(lessonid, data);
    return datas;
  }
  async updateTaskinRepo(data: ITask, taskId: string): Promise<ITask | null> {
    return await this.CourseRepo.UpdateTask(taskId, data);
  }
  async getLesson(lessonid: string): Promise<ILesson | null> {
    return this.CourseRepo.FindLessonByid(lessonid);
  }
  async addLessoninCourse(courseId: string, lessonid: string): Promise<void> {
    return await this.CourseRepo.UpdataCourse(courseId, {
      $push: { lessons: lessonid },
    } as any);
  }

  async updateCourse(
    courseId: string,
    data: Omit<CourseDTO, "lessons">
  ): Promise<void> {
    const datas = await this.CourseRepo.UpdataCourse(courseId, data);
    return;
  }
  async deleteCourse(courseid: string): Promise<void> {
    await this.CourseRepo.deleteCourse(courseid);
    console.log("in use case delete course");

    return;
  }
  async deletedtask(taskid: string, lessonid: string): Promise<void> {
    await this.CourseRepo.DeleteTaskFromLesson(lessonid, taskid);
    await this.CourseRepo.deleteTask(taskid);
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
    console.log("Fetching user progress data for user:", userid);

    // Fetch all progress data for the user
    const progressData = await this.CourseRepo.getAllprogressByuserid(userid);
    console.log("Progress data:", progressData);

    let totalProgress = 0;
    let coursesCount = 0;
    let completedCourse = 0;

    // Iterate through each course progress
    progressData?.forEach((data: any) => {
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
        console.warn(`Invalid score found for user ${userid}:`, data.Score);
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
      console.log(courseid, userid, "data is ");

      const course = await this.CourseRepo.FindSelectedCourse(courseid);
      console.log("courseis ", course);

      if (!course) {
        throw new Error("Course not found");
      }

      // Initialize an array to hold lesson progress
      const lessonProgress: ILessonProgress[] = [];

      // Iterate through each lesson in the course
      course.lessons.forEach((lesson: any) => {
        // Initialize an array to hold task progress for the current lesson
        const taskProgress: ITaskProgress[] = [];

        // Iterate through each task in the lesson
        lesson.Task.forEach((task: any) => {
          console.log(task, "task is ");

          let taskProgressItem: ITaskProgress | any = {};
          if (task.Type == "Video") {
            taskProgressItem = {
              Task_id: task._id.toString(), // Task ID
              userid: userid,
              Completed: false,
              Score: 0,
              WatchTime: 0,
              Status: "Not Started",
            };
          }
          if (task.Type == "Quiz") {
            taskProgressItem = {
              Task_id: task._id.toString(), // Task ID
              userid: userid,
              Completed: false,

              Status: "Not Started",
            };
          }
          if (task.Type == "Assignment") {
            taskProgressItem = {
              Task_id: task._id.toString(), // Task ID
              userid: userid,
              Completed: false,
              responce: "",
              Status: "Not Started",
            };
          }
          console.log(taskProgressItem);

          // Add the task progress to the array
          // if (taskProgressItem && taskProgressItem.keys.length !== 0) {
          taskProgress.push(taskProgressItem);
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
      console.log(lessonProgress, "data adn the uid is ", userid, courseid);

      await this.CourseRepo.createProgress(userid, courseid, lessonProgress);

      return;
    } catch (error: any) {
      throw new Error(error.message || "an Error occupied");
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
    const result: any = await this.CourseRepo.updateTaskProgress(
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
      console.log("yessss entered");
      let sertificate = await this.CertificateRepo.GetCertificateByCourseid(
        result.Student_id._id,
        result.Course_id._id
      );
      console.log(sertificate, "certificateis");

      if (!sertificate) {
        sertificate = await this.CertificateRepo.createCertificate(
          result.Student_id._id,
          result.Student_id.name,
          result.Course_id._id,
          result.Course_id.Title,
          result.Course_id.Category.Category,
          new Date()
        );
      }
      console.log(sertificate, "data isissisisisi");
      result.certificateId = sertificate?._id;
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
  async certificate(userid: string, courseid: string): Promise<any> {
    console.log(userid, courseid, "ididdiid");

    const ddd = await this.CertificateRepo.GetCertificateByCourseid(
      userid,
      courseid
    );
    console.log(ddd, "datatat");
    return ddd;
  }
  async getAllCertificate(
    studentid: string,
    page: number = 1,
    limit: number = 10,
    search: any
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
  }
}
// interface I
