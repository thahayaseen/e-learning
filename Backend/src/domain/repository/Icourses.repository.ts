import mongoose from "mongoose";
import { CourseDTO } from "../../app/dtos/coursesDto";
import { orderDto } from "../../app/dtos/orderDto";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import {
  ILessonProgress,
  IProgressCollection,
} from "../../infra/database/models/progress";
import { IQuizTask, ITask, Task } from "../../infra/database/models/tasks";
import {
  ICourseFilter,
  IPaginationResult,
} from "../../infra/repositories/courses.repository";
import { CourseInterface } from "../entities/returndata";

export interface ICoursesRepository {
  createCourse(data: Omit<ICourses, "_id">): Promise<ICourses>;
  createTask(tasks: any): Promise<any>;
  createLesson(lessondata: any): Promise<any>;
  
  addTaskinsidelessone(lessonId: string, taskId: string): Promise<any>;
  getCourse(id: string, pipline: object[]): Promise<any>;
  getCourseByid(courseid: string): Promise<ICourses | null>;
  getLessons(id: string): Promise<any | null>;
  getByname(name: string, Mentor_id: string): Promise<any>;
  getUnaproved(
    data: { limit?: number; skip?: number },
    filter: object
  ): Promise<any>;
  getCourseByCategory(categoryid: string): Promise<ICourses[]>;
  applayAction(id: string, type: boolean): Promise<void>;
  getCourseUser(
    page: number,
    limit: number,
    sort: { field?: string; order?: "asc" | "desc" },
    filter: ICourseFilter
  ): Promise<IPaginationResult<any>>;
  getSingleCourse(id: string, isValid: boolean): Promise<ICourses | null>;
  AddStudentInCourse(courseId: string, userId: string): Promise<void>;
  UpdataCourse(courseid: string, data: Partial<CourseDTO>): Promise<void>;
  FindSelectedCourse(id: string): Promise<CourseDTO | null>;
  updateLesson(lessonId: string, data: any): Promise<ILesson | null>;
  DeleteLessonByid(id: string): Promise<any>;
  DeleteLessonFromCourse(courseId: string, lessonId: string): Promise<void>;
  FindLessonByid(id: string): Promise<ILesson | null>;
  UpdateTask(taskId: string, data: ITask): Promise<ITask | null>;
  FindTask(id: string): Promise<ITask | IQuizTask | null>;
  FindTaskFromlesson(lessonId: string, TaskId: string): Promise<void>;
  getCouseEachuser(
    CourseIds: string[],
    userId: string,
    page?: number,
    limit?: number
  ): Promise<ICourses[]>;
  getCourseBymentorRepository(user: string): Promise<ICourses[]>;
  deleteCourse(courseId: string): Promise<void>;
  DeleteTaskFromLesson(lessonid: string, taskid: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  createProgress(
    studentId: string,
    courseId: string,
    lessonProgress: ILessonProgress[] // Pass lesson progress from use case
  ): Promise<IProgressCollection>;
  getAllprogressByuserid(userid: string): Promise<IProgressCollection[] | null>;
  getSelectedcourseprogress(
    userid: string,
    courseid: string
  ): Promise<IProgressCollection | null>;
  getUserProgress(userIds: string[]): Promise<IProgressCollection[]>;
  createOrder(orderdata: orderDto): Promise<any>;
  updataOrder(
    orderid: string,
    updatedata: Partial<orderDto>,
    session?: mongoose.ClientSession
  ): Promise<orderDto | null>;

  updateTaskProgress(
    studentId: string,
    courseId: string,
    lessonId: string,
    taskId: string,
    taskType: string,
    // response: string,

    updateData: {
      watchTime?: number;
      isCompleted?: boolean;
      response?: string;
      score?: number;
    }
  ): Promise<IProgressCollection>;

  markLessonCompleted(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<IProgressCollection>;
  getorderByuidandCourse(
    userId: string,
    courseId: string,
    timelimit?: boolean
  ): Promise<orderDto | null>;
  getOneorder(userid: string, orderid: string): Promise<any>;
  getOrdersByMentorId(
    mentorId: string,
    page: number,
    limit: number
  ): Promise<any>;
  getAllordersAdmin(page: number, limit: number, filter: object): Promise<any>;
  getOrderStats(mentorId: string): Promise<any>;
  getRevenueData(mentorId: string): Promise<any>;
}
