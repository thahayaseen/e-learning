import IUserReposetory from "../../domain/repository/IUser";
import IRcategory from "../../domain/repository/IRcategory";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import { ICategory } from "../../infra/database/models/Category";
import { ICourses } from "../../infra/database/models/course";
import { Task } from "../../infra/database/models/tasks";
import { CourseDTO } from "../dtos/coursesDto";
export class MentorUsecase {
  constructor(
    private userRepo: IUserReposetory,
    private CategoryRepo: IRcategory,
    private CoursRepositry: ICoursesRepository
  ) {}

  async getallCategory() {
    return await this.CategoryRepo.getAllCategory();
  }

  async findUserid(email: string) {
    return await this.userRepo.findByEmail(email);
  }
  async getallCourses(id: string) {
    return await this.CoursRepositry.getCourse(id);
  }
  async getLesson(id: string) {
    const data = await this.CoursRepositry.getLessons(id);
    console.log(data);
    return data?.lessons;
  }
  async getCourseByName(name: string, Mentor_id: string) {
    return await this.CoursRepositry.getByname(name, Mentor_id);
  }
  async actionCourse(id: string, action: boolean) {
    await this.CoursRepositry.applayAction(id, action);
    return;
  }
  async updataCourse(courseId: string, data: CourseDTO) {
    await this.CoursRepositry.UpdataCourse(courseId, data);
  }
  async FindCourse(id: string): Promise<CourseDTO | null> {
    return await this.CoursRepositry.FindSelectedCourse(id);
  }
  async DeleteLesson(lesosnid:string): Promise<any> {
    console.log('in hsdrasdfjhdfajsdf');
    
    const categoryis = await this.CoursRepositry.FindLessonByid(lesosnid);
    console.log(categoryis);
    
    categoryis?.Task?.forEach(async (data) => {
      console.log(data, "task is ");

      await this.CoursRepositry.deleteTask(data);
    });

    return this.CoursRepositry.DeleteLessonByid(lesosnid);
  }
}
