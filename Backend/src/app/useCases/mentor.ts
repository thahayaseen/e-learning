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
  async getallCourses(id: string, filter: any) {
    const { page, limit, search, status, priceRange, sortBy } = filter;
    const skip = (page - 1) * limit;
    const match: any = { Mentor_id: id };
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
//       if(sortBy=="students"){
// sort.Students_enrolled
//       }
    }
    console.log(sort, "sort is ");

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
    const data = await this.CoursRepositry.getCourse(id, pipline);
    console.log(data, "course data is ");

    return data;
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
  async DeleteLesson(lesosnid: string): Promise<any> {
    console.log("in hsdrasdfjhdfajsdf");

    const categoryis = await this.CoursRepositry.FindLessonByid(lesosnid);
    console.log(categoryis);

    categoryis?.Task?.forEach(async (data) => {
      console.log(data, "task is ");

      await this.CoursRepositry.deleteTask(data);
    });

    return this.CoursRepositry.DeleteLessonByid(lesosnid);
  }
  async getOrderBymentor(
    mentorid: string,
    page: number,
    limit: number
  ): Promise<any> {
    return await this.CoursRepositry.getOrdersByMentorId(mentorid, page, limit);
  }
  async getState(mentorid: string): Promise<any> {
    return await this.CoursRepositry.getOrderStats(mentorid);
  }
  async getRevenueData(mentorid: string): Promise<any> {
    return await this.CoursRepositry.getRevenueData(mentorid);
  }
}
