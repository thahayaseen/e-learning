import { CertificateDTO } from "../../app/dtos/Certificate";

import { orderDto } from "../../app/dtos/orderDto";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import { IProgressCollection } from "../../infra/database/models/progress";
import { IReview } from "../../infra/database/models/reiview";
import { IQuizTask, ITask } from "../../infra/database/models/tasks";
import { IPaginationResult } from "../../infra/repositories/courses.repository";
import { Course } from "../entities/course.entitis";
import { CourseInterface } from "../entities/returndata";

export interface ICourseUseCase {
  getCourseByName(name: string, Mentor_id: string): Promise<any>;
  getAllCourse(
    page: number,
    limit: number,
    sort: any,
    filter?: any
  ): Promise<IPaginationResult<any>>;
  getSelectedCourse(
    id: string,
    isValid: boolean,
    userid?: string
  ): Promise<any>;
  Conformpayment(
    updateData: Partial<orderDto>,
    orderid: string
  ): Promise<orderDto>;
  purchaseCourse(userId: string, courseId: string): Promise<void>;
  createOrder(course: orderDto): Promise<orderDto>;
  getByCoursidByUserid(
    CourseIds: string[],
    userid: string,
    page?: number,
    limit?: number
  ): Promise<ICourses[]>;
  addlessons(data: ILesson[]): Promise<any>;
  createCourse(datas: Omit<ICourses, "_id">): Promise<any>;
  createTaskandaddtoLesson(
    data: ITask,
    lessonId: string
  ): Promise<ILesson | null>;

  getLesson(lessonid: string): Promise<ILesson | null>;
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
  updateLesson(
    lessonid: string,
    data: Omit<ILesson, "Task">
  ): Promise<ILesson | null>;
  addLessoninCourse(courseId: string, lessonid: string): Promise<void>;
  deleteCourse(courseid: string): Promise<void>;
  deletedtask(taskid: string, lessonid: string): Promise<void>;
  deleteLessonfromcourse(courseId: string, lessonid: string): Promise<void>;
  getuserallCourseprogresdata(userid: string): Promise<any>;
  getTaskByid(taskid: string): Promise<ITask | IQuizTask | null>;
  updateOrder(
    updateData: Partial<orderDto>,
    orderid: string
  ): Promise<orderDto>;

  updateTaskinRepo(data: ITask, taskId: string): Promise<ITask | null>;
  markLessonCompleteduseCase(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<IProgressCollection>;
  getSelectedProgress(
    courseid: string,
    userid: string
  ): Promise<IProgressCollection | null>;
  addRating(
    userid: string,
    courseid: string,
    rating: number,
    title: string,
    comment: string
  ): Promise<void>;
  getallReviews(courseid: string): Promise<IReview[]>;
  checkOrderDupication(
    userid: string,
    courseid: string,
    type: boolean
  ): Promise<orderDto | null>;
  repayOrder(userid: string, orderid: string): Promise<Partial<orderDto>>;
  certificate(userid: string, courseid: string): Promise<any>;
  getAllCertificate(
    studentid: string,
    page: number,
    limit: number,
    search: any
  ): Promise<{ data: CertificateDTO[]; total: number }>;
  actionCourse(coureseId: string, action: boolean): Promise<void>;
  // actionCourse(coureseId: string, action: boolean): Promise<void> 
  getallCourses(id: string, filter: any): Promise<any> 
}
