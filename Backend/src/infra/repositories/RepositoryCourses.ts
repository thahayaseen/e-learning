import { CourseDTO } from "../../app/dtos/coursesDto";
import { ICoursesRepository } from "../../domain/repository/IRepositoryCourses";
import Courses, { ICourses } from "../database/models/course";
import Lesson, { ILesson } from "../database/models/lessone";
import ProgressCollection, {
  IProgressCollection,
} from "../database/models/progress";
import {
  AssignmentTask,
  ITask,
  QuizTask,
  Task,
  VideoTask,
} from "../database/models/tasks";

export class RepositoryCourses implements ICoursesRepository {
  async createCourse(data: Omit<ICourses, "_id">): Promise<ICourses> {
    const datas = await Courses.create(data);

    return datas;
  }
  async createTask(tasks: ITask[]): Promise<any> {
    console.log(tasks);

    const datas = await Task.create(tasks);

    const ids = datas.map((data) => {
      return data._id;
    });

    return ids;
  }
  async createLesson(lessondata: any): Promise<any> {
    const dat = await Lesson.create(lessondata);

    return dat;
  }
  async addTaskinsidelessone(lessonId: string, taskId: string) {
    return await Lesson.findOneAndUpdate(
      { _id: lessonId },
      { $push: { Task: taskId } },
      { new: true } // This returns the updated document
    );
  }
  async getCourse(id: string): Promise<any> {
    console.log(id, "in geting");

    return await Courses.find({
      $and: [{ Mentor_id: id }],
    }).populate("Category");
  }
  async getLessons(id: string): Promise<any | null> {
    console.log(id);
    return await Courses.findOne({ _id: id }).populate({
      path: "lessons",
      populate: {
        path: "Task",
      },
    });
  }
  async getByname(name: string, Mentor_id: string) {
    return await Courses.find({
      $and: [{ Title: name }, { Mentor_id: Mentor_id }],
    });
  }
  async getUnaproved(
    {
      limit,
      skip,
    }: {
      limit?: number;
      skip?: number;
    },
    filter: object
  ): Promise<any> {
    console.log(filter);

    const data = await Courses.find(filter)
      .skip(skip || 0)
      .limit(limit || 0)
      .populate("Mentor_id", "name -_id")
      .populate("Category", "Category -_id")
      .sort({ UpdatedAt: -1 });

    const total = await Courses.find(filter).countDocuments();
    return { data, total };
  }
  async applayAction(id: string, type: boolean) {
    const types = type ? "approved" : "rejected";
    await Courses.updateOne({ _id: id }, { Approved_by_admin: types });
    return;
  }
  async getCourseUser(limit: number = 0, filter: boolean = false): Promise<ICourses[]> {
    const matchFilter = { Approved_by_admin: "approved" };

    return await Courses.aggregate([
        { $match: matchFilter }, // Filter only approved courses
        { 
            $addFields: { 
                enrolledCount: { $size: "$Students_enrolled" } // Count the students enrolled
            }
        },
        { $sort: filter ? { enrolledCount: -1 } : { UpdatedAt: -1 } }, // Sort based on filter condition
        { $limit: limit }, // Apply limit
        { 
            $lookup: { 
                from: "users", 
                localField: "Mentor_id", 
                foreignField: "_id", 
                as: "MentorData" 
            } 
        },
        { 
            $lookup: { 
                from: "categories", 
                localField: "Category", 
                foreignField: "_id", 
                as: "CategoryData" 
            } 
        },
        { 
            $project: { 
                CreatedAt: 0, 
                "MentorData._id": 0, 
                "CategoryData._id": 0 
            } 
        }
    ]);
}


  async getSingleCourse(
    id: string,
    isValid: boolean
  ): Promise<ICourses | null> {
    try {
      console.log(isValid);

      const query = Courses.findOne({ _id: id, Approved_by_admin: "approved" })
        .populate("Mentor_id", "name _id")
        .populate("Category", "Category -_id");

      if (isValid) {
        query.populate({
          path: "lessons",
          select: "-_id",
          populate: {
            path: "Task",
          },
        });
      }

      return await query;
    } catch (error) {
      throw new Error("Course Not found");
    }
  }

  async AddStudentInCourse(courseId: string, userId: string) {
    await Courses.updateOne(
      { _id: courseId },
      { $push: { Students_enrolled: userId } }
    );
    return;
  }
  async UpdataCourse(courseid: string, data: any): Promise<void> {
    console.log(data);

    const res = await Courses.updateOne({ _id: courseid }, data);
    console.log(res);

    return;
  }
  async FindSelectedCourse(id: string): Promise<CourseDTO | null> {
    return await Courses.findOne({ _id: id });
  }
  // lesson managing
  async updateLesson(lessonId: string, data: any): Promise<ILesson | null> {
    let qury: any = {};
    delete data.Task;
    if (data.utask) {
      qury.$push = { Task: { $each: data.utask } };
    }
    qury.$set = data;

    return await Lesson.findByIdAndUpdate(lessonId, qury, { new: true });
  }

  async DeleteLessonByid(id: string): Promise<any> {
    return await Lesson.deleteOne({ _id: id });
  }
  async DeleteLessonFromCourse(
    courseId: string,
    lessonId: string
  ): Promise<void> {
    Courses.findByIdAndUpdate(
      courseId,
      { $pull: { lessons: lessonId } },
      { new: true }
    );
    return;
  }
  async DeleteTaskFromLesson(lessonid: string, taskid: string): Promise<void> {
    Lesson.findByIdAndUpdate(
      lessonid,
      { $pull: { Task: taskid } },
      { new: true }
    );
    return;
  }
  async FindLessonByid(id: string): Promise<ILesson | null> {
    return await Lesson.findById(id);
  }
  // task managing
  async UpdateTask(taskId: string, data: ITask): Promise<ITask | null> {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      console.log("Task not found!");
      throw new Error("Task not found!");
    }

    if (existingTask.Type === "Quiz") {
      return await QuizTask.findByIdAndUpdate(taskId, data, {
        new: true,
        runValidators: true,
      });
    } else if (existingTask.Type === "Assignment") {
      return await AssignmentTask.findByIdAndUpdate(taskId, data, {
        new: true,
      });
    } else if (existingTask.Type === "Video") {
      return await VideoTask.findByIdAndUpdate(taskId, data, { new: true });
    } else {
      // console.log("Invalid task type!");
      throw new Error("Invalid task type!");
    }
  }
  async FindTask(id: string): Promise<ITask | null> {
    return await Task.findById(id);
  }
  async FindTaskFromlesson(lessonId: string, TaskId: string): Promise<void> {
    await Lesson.findByIdAndUpdate(lessonId, {
      $pull: { Task: TaskId },
    });
    return;
  }
  async deleteTask(id: string): Promise<void> {
    await Task.deleteOne({ _id: id });

    return;
  }

  // ----------------------------------------------
  async getCouseEachuser(CourseIds: string[]): Promise<ICourses[]> {
    return await Courses.find({ _id: { $in: CourseIds } });
  }
  async getCourseBymentor(mentorid: string): Promise<ICourses | null> {
    return await Courses.findOne({ Mentor_id: mentorid });
  }
  async deleteCourse(courseId: string): Promise<void> {
    await Courses.findByIdAndDelete(courseId);
    return;
  }
  async createProgress(data: IProgressCollection): Promise<void> {
    await ProgressCollection.create(data);
  }
  async getAllprogressByuserid(
    userid: string
  ): Promise<IProgressCollection[] | null> {
    return await ProgressCollection.find({ Student_id: userid });
  }
  async getSelectedcourseprogress(
    courseid: string,
    userid: string
  ): Promise<IProgressCollection | null> {
    return await ProgressCollection.findOne({
      Course_id: courseid,
      Student_id: userid,
    })
      .populate({
        path: "lesson_progress.Lesson_id", // Populate Lesson_id inside lesson_progress array
      })
      .exec();
  }
  async getUserProgress(userIds: string[]): Promise<IProgressCollection[]> {
    return await ProgressCollection.find({ Student_id: { $in: userIds } })
      .populate("Course_id", "Title")
      .lean();
  }
}
