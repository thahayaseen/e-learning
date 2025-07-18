import { UserUsecase } from "../useCases/User.usecase";
import { CourseUsecase } from "../useCases/CourseUsecase";
import { IUserModel } from "../../infra/database/models/User";
import { ICourses } from "../../infra/database/models/course";
import { ILesson } from "../../infra/database/models/lessone";
interface PipelineData {
  search?: string;
  filter?: string;
  sort?: Record<string, 1 | -1>;
  page?: number;
  limit?: number;
  populate?: object[];
}
export class userServises {
  constructor(
    private userUsecase: UserUsecase,
    private courseUsecase: CourseUsecase
  ) {}

  verify = async (
    email: string,
    courseId: string,
    lessonid?: string,
    islesson: boolean = true,
    taskId?: string,
    isCourseDelete: boolean = true
  ) => {
    const user = await this.userUsecase.UseProfileByemail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const course = await this.courseUsecase.getSelectedCourse(courseId, false) as ICourses
    if (!course) {
      throw new Error("Course not found");
    }

    if (String(course.Mentor_id.mentorId) !== String(user._id)) {
      throw new Error("You don't have permission");
    }

    if (course.Approved_by_admin === "approved" && isCourseDelete) {
      throw new Error("Cannot update approved Course");
    }

    const lessonIndex = course.lessons.findIndex(
      (data: ILesson) => String(data._id) === lessonid
    ) 

    if (lessonid && islesson && lessonIndex === -1) {
      throw new Error("You don't have permission for this lesson");
    }

    if (!islesson) {
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      if (!lessonid) {
        throw new Error("Lesson ID is required for task validation");
      }

      const lesson = await this.courseUsecase.getLessonByid(lessonid);
      if (!lesson ||(lesson.Task&& !lesson.Task.includes(taskId as never))) {
        throw new Error("Unauthorized Task");
      }
    }

    return { user, course };
  };
  getpurchasedCourses = async (
    data: string[],
    userid: string,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      const datas = await this.courseUsecase.getByCoursidByUserid(
        data,
        userid,
        page,
        limit
      );
      return datas;
    } catch (error) {
      throw new Error("An error occupied");
    }
  };
  
}
