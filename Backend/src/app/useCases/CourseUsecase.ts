import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import IUserReposetory from "../../domain/repository/IUser";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
import { ITask } from "../../infra/database/models/tasks";
import { CourseDTO } from "../dtos/coursesDto";

export class CourseUsecase implements ICourseUseCase {
  constructor(
    private userRepo: IUserReposetory,
    private CourseRepo: ICoursesRepository
  ) {}
  async getCourseBymentor(id: string): Promise<ICourses | null> {
    return await this.CourseRepo.getCourseBymentor(id);
  }
  async getAllCourse(limit: number): Promise<ICourses[]> {
    return await this.CourseRepo.getCourseUser(limit);
  }
  async getSelectedCourse(id: string, isValid: boolean) {
    try {
      return await this.CourseRepo.getSingleCourse(id, isValid);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async purchaseCourse(userId: string, courseId: string) {
    try {
      await this.CourseRepo.AddStudentInCourse(courseId, userId);
      await this.userRepo.addCourseInstudent(userId, courseId);
      const courses = await this.CourseRepo.FindSelectedCourse(courseId);

      const lessons = courses?.lessons.map((data) => {
        return { Lesson_id: String(data) };
      });
      console.log(lessons, "all lesojsss");
      if (lessons) {
        await this.CourseRepo.createProgress({
          Course_id: courseId,
          lesson_progress: lessons,
          Student_id: userId,
        });
      }
      return;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getByCoursids(CourseId: string[]) {
    return await this.CourseRepo.getCouseEachuser(CourseId);
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
  async updateTaskinRepo(data: ITask, taskId: string) {
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
    if (!data) {
      throw new Error("Course Not found");
    }
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
    this.CourseRepo.DeleteLessonFromCourse(courseId, lessonid);
  }
  async getuserallCourseprogresdata(userid: string) {
    console.log('in herer');
    
    const dat = await this.CourseRepo.getAllprogressByuserid(userid);
    console.log(dat);
    
    let progress = 0;
    let coursesCount = 0;
    let completedCourse = 0;
    dat?.forEach((data) => {
      console.log(data.Score,'datasss');
      
      progress += Number(data.Score);
      coursesCount++;
      if (data.Score == 100) {
        completedCourse++;
      }
    });
    const pdata=(progress/coursesCount)
    return {progresPersentage:pdata,coursesCount,completedCourse}
  }
}
// interface I
