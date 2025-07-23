import mongoose, { FilterQuery, Types } from "mongoose";
import { CourseDTO } from "../../app/dtos/coursesDto";
import { orderDto } from "../../app/dtos/orderDto";
import { ICoursesRepository } from "../../domain/repository/Icourses.repository";
import Courses, { ICourses } from "../database/models/course";
import Lesson, { ILesson } from "../database/models/lessone";
import { OrderSchemas } from "../database/models/order";
import ProgressCollection, {
  ILessonProgress,
  IProgressCollection,
  ITaskProgress,
} from "../database/models/progress";
import {
  AssignmentTask,
  ITask,
  QuizTask,
  Task,
  VideoTask,
} from "../database/models/tasks";
import User from "../database/models/User";

export interface IPaginationResult<T> {
  courses: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ICourseFilter {
  level?: string;
  price?: { min?: number; max?: number };
  category?: string;
  search?: string;
}
export class RepositoryCourses implements ICoursesRepository {
  private MENTOR_REVENUE_PERCENTAGE = 90;
  private ADMIN_REVENUE_PERCENTAGE = 10;
  async createCourse(data: Omit<ICourses, "_id">): Promise<ICourses> {
    const datas = await Courses.create(data)

    return datas.populate('Category',"Category -_id")
  }
  async createTask(tasks: ITask[]): Promise<any> {
 

    const datas = await Task.create(tasks);

    const ids = datas.map((data) => {
      return data._id;
    });

    return ids;
  }
  async createLesson(lessondata: Partial<ILesson>): Promise<ILesson> {
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
  async getCourse(id: string, pipline: any[]): Promise<any> {
 
    const data = await Courses.aggregate(pipline);

    return data;
  }
  async getCourseByid(courseid: string): Promise<ICourses | null> {
    return await Courses.findById(courseid).populate("Mentor_id", "-_id name");
  }
  async getLessons(id: string): Promise<any | null> {
 
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
 console.log(JSON.stringify(filter),'filter is ');
 

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
  async getCourseUser(
    page: number = 1,
    limit: number = 10,
    sort: { field?: string; order?: "asc" | "desc" } = {
      field: "UpdatedAt",
      order: "desc",
    },
    filter: FilterQuery<ICourses> = {}
  ): Promise<IPaginationResult<any>> {
    // Base match filter for approved courses
    const matchFilter: any = {
      // Approved_by_admin: "approved",
      unlist: false,
    };
    if (filter.fromUser) {
      matchFilter.Approved_by_admin = "approved";
    }
    // Apply additional filters
    if (filter.level) {
      matchFilter.Level = filter.level;
    }

    if (filter.price) {
      matchFilter.Price = {};
      if (filter.price.min !== undefined) {
        matchFilter.Price.$gte = filter.price.min;
      }
      if (filter.price.max !== undefined) {
        matchFilter.Price.$lte = filter.price.max;
      }
    }

    // Handle category filter - support for filtering from all categories
    if (filter.category) {
      matchFilter.Category = new Types.ObjectId(filter.category);
    }
 

    // Add mentor filter
    if (filter.mentor) {
      matchFilter.Mentor_id = new Types.ObjectId(filter.mentor);
    }

    // Add search filter
    if (filter.search) {
      matchFilter.$or = [
        { Title: { $regex: filter.search, $options: "i" } },
        { Description: { $regex: filter.search, $options: "i" } },
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;


    const sortField = sort.field || "UpdatedAt";
    const sortOrder = sort.order === "asc" ? 1 : -1;

    // Create sort object for aggregation
    const sortStage: any = {
      $sort: {
        [sortField]: sortOrder as 1 | -1,
      },
    };
 

    const pipeline = [
      { $match: matchFilter },
      {
        $addFields: {
          enrolledCount: { $size: "$Students_enrolled" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "Mentor_id",
          foreignField: "_id",
          as: "Mentor",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "Category",
          foreignField: "_id",
          as: "CategoryData",
        },
      },
      { $unwind: "$CategoryData" },

      sortStage, // Apply sorting here
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                Mentor: "$Mentor.name",
                Mentor_id: 1,
                Category: {
                  _id: "$CategoryData._id",
                  Category: "$CategoryData.Category",
                },
                Title: 1,
                Description: 1,
                Price: 1,
                image: 1,
                Level: 1,
                Approved_by_admin: 1,
                enrolledCount: 1,
                UpdatedAt: 1,
                CreatedAt: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await Courses.aggregate(pipeline);
 

    const courses = results[0].paginatedResults;
 

    const total = results[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      courses,
      total,
      page,
      totalPages,
      limit,
    };
  }
  async getCourseByCategory(categoryid: string): Promise<ICourses[]> {
    return await Courses.find({ Category: categoryid });
  }

  async getSingleCourse(id: string, isValid: boolean): Promise<any | null> {
    try {
 
 console.log('isValid is ',isValid);
 
      let lessonPopulate: any = {};
      if (isValid) {
        lessonPopulate = {
          $lookup: {
            from: "lessons",
            localField: "lessons",
            foreignField: "_id",
            as: "lessons",
            pipeline: [
              {
                $lookup: {
                  from: "tasks",
                  localField: "Task",
                  foreignField: "_id",
                  as: "Task",
                },
              },
              {$project:{__v:0,"Task.__v":0}}
            ],
          }

        };
      } else if (!isValid) {
        console.log('from here');
        
        lessonPopulate = {
          $lookup: {
            from: "lessons",
            localField: "lessons",
            foreignField: "_id",
            as: "lessons",
            pipeline: [
              {
                $project: {
                  Lessone_name: 1,
                  Content:1,
                  Task: 1,

                },
              },
              {
                $lookup: {
                  from: "tasks",
                  localField: "Task",
                  foreignField: "_id",
                  as: "Task",
                },
              },
              {
                $project: {
                  Lessone_name: 1,
                  "Task._id": 1,
                  "Task.Type": 1,
                  "Task.__v":0,
                  Content:1,
                  __v:0
                },
              },
            ],
          },
        };
      }
      const pipline = [
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "beamentors",
            localField: "Mentor_id",
            foreignField: "userid",
            as: "Mentor_id",
            pipeline: [
              {
                $project: {
                  name: "$fullname",
                  phone: "$mobile",
                  mentorId: "$userid",
                  qualification: "$qualification",
                  experience: "$experience",
                  profileLink: "$profileLink",
                  profileImage: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$Mentor_id",
        },
        {
          $lookup: {
            from: "categories",
            localField: "Category",
            foreignField: "_id",
            as: "Category",
            pipeline: [
              {
                $project: {
                  Category: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$Category" },
        lessonPopulate,
        {$project:{__v:0}}
      ];
 

      const query = await Courses.aggregate(pipline);
 

      return query[0];
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
 
 

 

    const res = await Courses.updateOne({ _id: courseid }, data);
 

    return;
  }
  async FindSelectedCourse(id: string): Promise<CourseDTO | null | any> {
    return await Courses.findOne({ _id: id }).populate({
      path: "lessons",
      populate: {
        path: "Task",
      },
    });
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

  async DeleteLessonByid(id: Types.ObjectId): Promise<any> {
    return await Lesson.deleteOne({ _id: id });
  }
  async DeleteLessonFromCourse(
    courseId: string,
    lessonId: string
  ): Promise<void> {
    const dat = await Courses.findByIdAndUpdate(
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
  async FindLessonByid(id: Types.ObjectId): Promise<ILesson | null> {
    return await Lesson.findById(id);
  }
  // task managing
  async UpdateTask(taskId: string, data: ITask): Promise<ITask | null> {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
 
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
  async deleteTask(id: Types.ObjectId): Promise<void> {
    await Task.deleteOne({ _id: id });

    return;
  }

  // ----------------------------------------------
  async getCouseEachuser(
    CourseIds: string[],
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    const skip = (page - 1) * limit;
 

    const anss = await Courses.aggregate<ICourses>([
      {
        $match: { _id: { $in: CourseIds.map((id) => new Types.ObjectId(id)) } },
      },
      {
        $lookup: {
          from: "users",
          localField: "Mentor_id",
          foreignField: "_id",
          as: "mentor",
          pipeline: [
            {
              $project: { name: 1, _id: 0 }, // Correct way to select only the 'name' field
            },
          ],
        },
      },
      {
        $unwind: "$mentor",
      },
      {
        $lookup: {
          from: "progresscollections",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$Course_id", "$$courseId"] },
                    { $eq: ["$Student_id", new Types.ObjectId(userId)] }, // Ensure `userId` is an ObjectId
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                OverallScore: 1,
                __v:0
              },
            },
          ],
          as: "progress",
        },
      },
      {
        $unwind: {
          path: "$progress",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [
            { $sort: { CreatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);
 

    return anss[0];
  }
  async getCourseBymentorRepository(mentorid: string): Promise<ICourses[]> {
    return await Courses.find({ Mentor_id: mentorid });
  }
  async deleteCourse(courseId: string): Promise<void> {
    await Courses.findByIdAndDelete(courseId);
    return;
  }
  async getSelectedcourseprogress(
    studentId: string,
    courseId: string
  ): Promise<IProgressCollection | null> {
    return await ProgressCollection.findOne({
      Student_id: studentId,
      Course_id: courseId,
    },{__v:0})
      .populate({
        path: "lesson_progress.Lesson_id",
        select:'-__v',
        populate: {
          path: "Task",
          select: '-__v'
        },
      })
      .exec();
  }

  async createProgress(
    studentId: string,
    courseId: string,
    lessonProgress: ILessonProgress[]
  ): Promise<IProgressCollection> {
    const progress = new ProgressCollection({
      Student_id: studentId,
      Course_id: courseId,
      lesson_progress: lessonProgress, // Use the provided lesson progress
      UpdatedAt: new Date(),
      CreatedAt: new Date(),
      OverallScore: 0, // Initialize overall score to 0
    });

    await progress.save();
    return progress;
  }

  async getAllprogressByuserid(
    userid: string
  ): Promise<IProgressCollection[] | null> {
    return await ProgressCollection.find({ Student_id: userid });
  }

  async getUserProgress(userIds: string[]): Promise<IProgressCollection[]> {
    return await ProgressCollection.find({ Student_id: { $in: userIds } })
      .populate("Course_id", "Title")
      .lean();
  }
  async createOrder(orderdata: orderDto): Promise<any> {
 

    return await new OrderSchemas(orderdata).save();
  }
  async updataOrder(
    orderid: string,
    updatedata: Partial<orderDto>,
    session?: mongoose.ClientSession
  ): Promise<orderDto | null> {
 

    return await OrderSchemas.findByIdAndUpdate(orderid, updatedata, {
      new: true,
      session,
    });
  }

  async getorderByuidandCourse(
    userId: string,
    courseId: string,
    timelimit: boolean = false
  ): Promise<orderDto | null> {
    const pipeline: Record<string, any> = {
      userId,
      courseId,
      paymentStatus: "pending",
    };

    if (timelimit) {
      pipeline["createdAt"] = { $gt: new Date(Date.now() - 5 * 60 * 1000) };
    }

    return await OrderSchemas.findOne(pipeline);
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
    // Find the progress document for the student and course
    let progress = await ProgressCollection.findOne({
      Student_id: studentId,
      Course_id: courseId,
    });

    if (!progress) {
      throw new Error("Progress not found");
    }

    // Find the lesson progress
    const lessonIndex = progress.lesson_progress.findIndex(
      (lesson) => lesson.Lesson_id.toString() === lessonId
    );

    if (lessonIndex === -1) {
      throw new Error("Lesson progress not found");
    }

    const lessonProgress = progress.lesson_progress[lessonIndex];

    // Find the task progress
    const taskIndex = lessonProgress.Task_progress.findIndex(
      (task) => task.Task_id.toString() === taskId
    );

    if (taskIndex === -1) {
      throw new Error("Task progress not found");
    }

    const taskProgress = lessonProgress.Task_progress[taskIndex];

    // Update the task progress based on the task type
    if (taskType === "Video") {
      if (updateData.watchTime !== undefined) {
        // Only add the difference in watch time, not the full amount again
        const additionalWatchTime =
          updateData.watchTime - (taskProgress.WatchTime || 0);
        taskProgress.WatchTime = updateData.watchTime;

        // Update lesson watch time by adding only the additional time
        if (additionalWatchTime > 0) {
          lessonProgress.WatchTime =
            (lessonProgress.WatchTime || 0) + additionalWatchTime;
        }
      }
      if (updateData.isCompleted !== undefined) {
        taskProgress.Completed = updateData.isCompleted;
        taskProgress.Status = updateData.isCompleted
          ? "Completed"
          : "In Progress";
      }
    } else if (taskType === "Quiz") {
      if (updateData.isCompleted !== undefined) {
        taskProgress.Completed = updateData.isCompleted;
        taskProgress.Status = updateData.isCompleted
          ? "Completed"
          : "In Progress";
      }
      if (updateData.score !== undefined) {
        taskProgress.Score = updateData.score;
      }
    } else if (taskType === "Assignment") {
      if (updateData.response !== undefined) {
        taskProgress.response = updateData.response;
      }
      if (updateData.isCompleted !== undefined) {
        taskProgress.Completed = updateData.isCompleted;
        taskProgress.Status = updateData.isCompleted
          ? "Completed"
          : "In Progress";
      }
    }

    // Check if all tasks in the lesson are completed
    const allTasksCompleted = lessonProgress.Task_progress.every(
      (task) => task.Completed
    );

    lessonProgress.Completed = allTasksCompleted;

    // Calculate overall progress and score
    const calculateOverallProgress = () => {
      // Count total and completed tasks across all lessons
      let totalTasks = 0;
      let completedTasks = 0;

      // Track quiz and assignment scores separately
      let quizScores: number[] = [];
      let assignmentScores: number[] = [];

      // Process all lessons and their tasks
      progress.lesson_progress.forEach((lesson) => {
        lesson.Task_progress.forEach((task) => {
          totalTasks++;
          if (task.Completed) {
            completedTasks++;
          }

          // Collect scores by task type
          if (task.Score !== undefined) {
            // Assuming task type is stored somewhere or can be inferred
            // For this example, we'll check if it has a response (assignment) or not (quiz)
            if (task.response) {
              assignmentScores.push(task.Score);
            } else {
              quizScores.push(task.Score);
            }
          }
        });
      });

      // Calculate average scores
      const avgQuizScore =
        quizScores.length > 0
          ? quizScores.reduce((sum, score) => sum + score, 0) /
            quizScores.length
          : 0;

      const avgAssignmentScore =
        assignmentScores.length > 0
          ? assignmentScores.reduce((sum, score) => sum + score, 0) /
            assignmentScores.length
          : 0;

      // Calculate task completion percentage
      const taskCompletionPercentage = (completedTasks / totalTasks) * 100;

 

      progress.OverallScore =
        progress.OverallScore == 100
          ? progress.OverallScore
          : Math.round(taskCompletionPercentage);
    };

    // Calculate and update overall progress
    calculateOverallProgress();

    // Update timestamp
    progress.UpdatedAt = new Date();

    await progress.save();
    // Save the updated progress
    const res: any = await ProgressCollection.findOne({
      Student_id: studentId,
      Course_id: courseId,
    })
      .populate("Student_id", "name")
      .populate({
        path: "Course_id",
        select: "Title Category",
        populate: {
          path: "Category",
          select: "Category",
        },
      });

    return res as IProgressCollection;
  }
  async createProgressForuser(progressData: IProgressCollection) {
    await ProgressCollection.create(progressData);
  }
  // Mark a lesson as completed (for quizzes/assignments)
  async markLessonCompleted(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<IProgressCollection> {
    const progress = await ProgressCollection.findOne({
      Student_id: studentId,
      Course_id: courseId,
    });

    if (!progress) {
      throw new Error("Progress not found");
    }

    const lessonIndex = progress.lesson_progress.findIndex((lesson) => {
      if (lesson && lesson.Lesson_id) {
        return lesson.Lesson_id.toString() === lessonId;
      }
    });

    if (lessonIndex !== -1) {
      progress.lesson_progress[lessonIndex].Completed = true;
      await progress.save();
      return progress;
    } else {
      throw new Error("Lesson not found in progress");
    }
  }
  async getOneorder(userid: string, orderid: string): Promise<any> {
 
    const data = await OrderSchemas.findOne({ _id: orderid, userId: userid });
 

    return data;
  }
  async getOrdersByMentorId(
    mentorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
 

      // Find all courses by this mentor
      const mentorCourses = await Courses.find({ Mentor_id: mentorId }).select(
        "_id"
      );
 

      const courseIds = mentorCourses.map((course) => course._id);

      // Find orders for these courses
      const orders = await OrderSchemas.find({
        courseId: { $in: courseIds },
      })
        .populate("userId", "name email")
        .populate("courseId", "Title ")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
 

      const total = await OrderSchemas.countDocuments({
        courseId: { $in: courseIds },
        paymentStatus: "paid",
      });

      return {
        orders: orders.map((order) => ({
          ...order.toObject(),
          mentorRevenue: this._calculateMentorRevenue(order.amount),
        })),
        totalPages: Math.ceil(total / limit),
        total,
        currentPage: page,
      };
    } catch (error) {
      throw new Error(
        `Error getting orders by mentor ID: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }
  private _calculateMentorRevenue(amount: number): number {
    return Number(amount * this.MENTOR_REVENUE_PERCENTAGE) / 100;
  }
  async getAllordersAdmin(
    page: number,
    limit: number,
    filter = {}
  ): Promise<any> {
    try {
 

      const skip = (page - 1) * limit;
      const query = { ...filter };
      const orders = await OrderSchemas.find(query)
        .populate("userId", "name email")
        .populate({
          path: "courseId",
          populate: {
            path: "Mentor_id",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
 

      const total = await OrderSchemas.countDocuments(query);
      return {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalOrders: total,
      };
    } catch (error) {
      console.log(
        `Error getting all orders: ${
          error instanceof Error ? error.message : " "
        }`
      );

      throw new Error(
        `Error getting all orders: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }
  async getOrderStats(mentorId: string): Promise<any> {
    try {
      // Find all courses by this mentor
      const mentorCourses = await Courses.find({ Mentor_id: mentorId }).select(
        "_id"
      );
      const courseIds = mentorCourses.map((course) => course._id);

      // Get all orders for these courses
      const orders = await OrderSchemas.find({ courseId: { $in: courseIds } })
        .populate("userId", "name email")
        .populate("courseId", "Title Price Category Students_enrolled");

      // Calculate stats
      const totalOrders = orders.length;

      // Count by payment status
      const paidOrders = orders.filter(
        (order) => order.paymentStatus === "paid"
      ).length;
      const pendingOrders = orders.filter(
        (order) => order.paymentStatus === "pending"
      ).length;
      const failedOrders = orders.filter(
        (order) => order.paymentStatus === "failed"
      ).length;

      // Calculate total revenue
      const totalRevenue = this._calculateMentorRevenue(
        orders
          .filter((order) => order.paymentStatus === "paid")
          .reduce((sum, order) => sum + order.amount, 0)
      );

      // Recent sales (last 10 paid orders)
      const recentSales = orders
        .filter((order) => order.paymentStatus === "paid")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);

      // Get course revenue breakdown
      const courseRevenue = await Courses.find({
        Mentor_id: mentorId,
      }).populate("Category", "name");

      // Return compiled stats
      const stats = {
        totalOrders,
        paidOrders,
        pendingOrders,
        failedOrders,
        totalRevenue,
        recentSales,
        courseRevenue,
      };

      return { success: true, stats };
    } catch (error) {
      console.error("Repository error getting mentor stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "cannot find teh stats",
      };
    }
  }

  async getRevenueData(mentorId: string): Promise<any> {
    try {
      // Find all courses by this mentor
      const mentorCourses = await Courses.find({ Mentor_id: mentorId }).select(
        "_id"
      );
      const courseIds = mentorCourses.map((course) => course._id);

      // Get all paid orders
      const orders = await OrderSchemas.find({
        courseId: { $in: courseIds },
        paymentStatus: "paid",
      }).sort("createdAt");

      // Group orders by month
      const revenueByMonth: any = {};

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const month = date.getMonth();
        const year = date.getFullYear();
        const period = `${year}-${month + 1}`;

        if (!revenueByMonth[period]) {
          revenueByMonth[period] = {
            period: `${getMonthName(month)} ${year}`,
            revenue: 0,
          };
        }

        revenueByMonth[period].revenue += order.amount;
      });

      // Convert to array and sort by date
      const data = Object.values(revenueByMonth).sort((a: any, b: any) => {
        const [aYear, aMonth] = a.period.split(" ");
        const [bYear, bMonth] = b.period.split(" ");

        const aDate = new Date(`${aMonth} 1, ${aYear}`).getTime();
        const bDate = new Date(`${bMonth} 1, ${bYear}`).getTime();

        return aDate - bDate;
      });

      return { success: true, data };
    } catch (error) {
      console.error("Repository error getting revenue data:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Cannot find the revenue data",
      };
    }
    function getMonthName(monthIndex: number) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months[monthIndex];
    }
  }

}
// Helper function to get month name
