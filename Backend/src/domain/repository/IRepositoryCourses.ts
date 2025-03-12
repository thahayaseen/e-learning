import { CourseDTO } from "../../app/dtos/coursesDto";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import { IProgressCollection } from "../../infra/database/models/progress";
import { ITask, Task } from "../../infra/database/models/tasks";
import { CourseInterface } from "../entities/returndata";

export interface ICoursesRepository {
  createCourse(data: Omit<ICourses, "_id">): Promise<ICourses>;
  createTask(tasks: any): Promise<any>;
  createLesson(lessondata: any): Promise<any>;
  addTaskinsidelessone(lessonId: string, taskId: string): Promise<any>;
  getCourse(id: string): Promise<any>;
  getLessons(id: string): Promise<any | null>;
  getByname(name: string, Mentor_id: string): Promise<any>;
  getUnaproved(
    data: { limit?: number; skip?: number },
    filter: object
  ): Promise<any>;
  applayAction(id: string, type: boolean): Promise<void>;
  getCourseUser(limit?: number): Promise<ICourses[]>;
  getSingleCourse(id: string, isValid: boolean): Promise<ICourses | null>;
  AddStudentInCourse(courseId: string, userId: string): Promise<void>;
  UpdataCourse(
    courseid: string,
    data: Omit<CourseDTO, "lessons">
  ): Promise<void>;
  FindSelectedCourse(id: string): Promise<CourseDTO | null>;
  updateLesson(lessonId: string, data: any): Promise<ILesson | null>;
  DeleteLessonByid(id: string): Promise<any>;
  DeleteLessonFromCourse(courseId: string, lessonId: string): Promise<void>;
  FindLessonByid(id: string): Promise<ILesson | null>;
  UpdateTask(taskId: string, data: ITask): Promise<ITask | null>;
  FindTask(id: string): Promise<ITask | null>;
  FindTaskFromlesson(lessonId: string, TaskId: string): Promise<void>;
  getCouseEachuser(CourseIds: string[]): Promise<ICourses[]>;
  getCourseBymentor(user: string): Promise<ICourses | null>;
  deleteCourse(courseId: string): Promise<void>;
  DeleteTaskFromLesson(lessonid: string, taskid: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  createProgress(data: IProgressCollection): Promise<void>;
  getAllprogressByuserid(userid: string): Promise<IProgressCollection[] | null>;
  getSelectedcourseprogress(
    courseid: string,
    userid: string
  ): Promise<IProgressCollection | null>;
}
