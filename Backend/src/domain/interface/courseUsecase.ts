import { CourseDTO } from "../../app/dtos/coursesDto";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import { ITask } from "../../infra/database/models/tasks";
import { CourseInterface } from "../entities/returndata";

export interface ICourseUseCase {
  getAllCourse(limit?: number): Promise<ICourses[]>;
  getSelectedCourse(id: string, isValid: boolean): Promise<ICourses | null>;
  purchaseCourse(userId: string, courseId: string): Promise<void>;
  getByCoursids(CourseIds: string[]): Promise<ICourses[]>;
  addlessons(data: ILesson[]): Promise<any>;
  createCourse(datas: Omit<ICourses, "_id">): Promise<any>;
  createTaskandaddtoLesson(
    data: ITask,
    lessonId: string
  ): Promise<ILesson | null>;
  getCourseBymentor(id: string): Promise<ICourses | null>;
  getLesson(lessonid: string): Promise<ILesson | null>;
  updateTaskinRepo(data: ITask, taskId: string): Promise<ITask | null>;
  updateLesson(
    lessonid: string,
    data: Omit<ILesson, "Task">
  ): Promise<ILesson | null>;
  updateCourse(courseId: string, data: CourseDTO): Promise<void>;
  addLessoninCourse(
    courseId: string,
    lessonid: string
  ): Promise<void>;
  deleteCourse(courseid: string): Promise<void>
  deletedtask(taskid: string,lessonid:string):Promise<void>
  deleteLessonfromcourse(courseId:string,lessonid:string):Promise<void>
  getuserallCourseprogresdata(userid: string):Promise<any>
}
