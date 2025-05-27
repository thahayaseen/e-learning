import { OrderSchemas } from "../database/models/order";
import Courses from "../database/models/course";
import User from "../database/models/User.js";
import IRevenueRepository from "../../domain/repository/Irevenue.repositroy.js";

class RevenueRepository implements IRevenueRepository {
  // Revenue split percentages
  #MENTOR_REVENUE_PERCENTAGE = 90;
  #ADMIN_REVENUE_PERCENTAGE = 10;

  async getTotalRevenue() {
    try {
      const result = await OrderSchemas.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]);

      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      throw new Error(
        `Failed to get total revenue: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }

  async getAdminRevenue() {
    try {
      const totalRevenue = await this.getTotalRevenue();
      return (totalRevenue * this.#ADMIN_REVENUE_PERCENTAGE) / 100;
    } catch (error) {
      throw new Error(
        `Failed to get admin revenue: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }

  async getMentorRevenue() {
    try {
      const mentorRevenue = await OrderSchemas.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $lookup: {
            from: "users",
            localField: "course.Mentor_id",
            foreignField: "_id",
            as: "mentor",
          },
        },
        { $unwind: "$mentor" },
        {
          $group: {
            _id: "$mentor._id",
            mentorName: { $first: "$mentor.name" },
            totalAmount: { $sum: "$amount" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $addFields: {
            // Calculate mentor revenue (90%)
            totalRevenue: {
              $multiply: [
                "$totalAmount",
                this.#MENTOR_REVENUE_PERCENTAGE / 100,
              ],
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);
 

      return mentorRevenue;
    } catch (error) {
      throw new Error(
        `Failed to get mentor revenue: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }

  async getTimeRevenue(timePeriod = "monthly") {
    try {
      let dateFormat;
      let dateGrouping;

      switch (timePeriod) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          dateGrouping = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };
          break;
        case "weekly":
          dateFormat = "%Y-W%U";
          dateGrouping = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          break;
        default: // monthly
          dateFormat = "%Y-%m";
          dateGrouping = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
      }
 

      const timeRevenue = await OrderSchemas.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: dateGrouping,
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $addFields: {
            // Admin gets 10% of revenue
            revenue: {
              $multiply: ["$totalAmount", this.#ADMIN_REVENUE_PERCENTAGE / 100],
            },
            period: {
              $dateToString: {
                format: dateFormat,
                date: {
                  $dateFromParts: {
                    year: { $ifNull: ["$_id.year", 1] },
                    month: { $ifNull: ["$_id.month", 1] },
                    day: { $ifNull: ["$_id.day", 1] },
                    
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: "$period",
            revenue: 1,
          },
        },
        { $sort: { _id: 1 } },
      ]);
 

      return timeRevenue;
    } catch (error) {
      throw new Error(
        `Failed to get time-based revenue: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }

  async getMentorRevenueById(mentorId: string) {
    try {
      // Find all courses by this mentor
      const mentorCourses = await Courses.find({ mentorId }).select("_id");
      const courseIds = mentorCourses.map((course) => course._id);

      // Calculate total revenue from orders for these courses
      const result = await OrderSchemas.aggregate([
        {
          $match: {
            courseId: { $in: courseIds },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            orderCount: { $sum: 1 },
          },
        },
      ]);

      if (result.length === 0) {
        return { totalRevenue: 0, orderCount: 0 };
      }

      // Calculate mentor's share (90%)
      const totalRevenue =
        (result[0].totalAmount * this.#MENTOR_REVENUE_PERCENTAGE) / 100;

      return {
        totalRevenue,
        orderCount: result[0].orderCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to get mentor revenue by ID: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }

  async getMentorTimeRevenue(mentorId: string, timePeriod = "monthly") {
    try {
      // Find all courses by this mentor
      const mentorCourses = await Courses.find({ mentorId }).select("_id");
      const courseIds = mentorCourses.map((course) => course._id);

      let dateFormat;
      let dateGrouping;

      switch (timePeriod) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          dateGrouping = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };
          break;
        case "weekly":
          dateFormat = "%Y-W%U";
          dateGrouping = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          break;
        default: // monthly
          dateFormat = "%Y-%m";
          dateGrouping = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
      }

      const timeRevenue = await OrderSchemas.aggregate([
        {
          $match: {
            courseId: { $in: courseIds },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: dateGrouping,
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $addFields: {
            revenue: {
              $multiply: [
                "$totalAmount",
                this.#MENTOR_REVENUE_PERCENTAGE / 100,
              ],
            },
            period: {
              $dateToString: {
                format: dateFormat,
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day",
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: "$period",
            revenue: 1,
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return timeRevenue;
    } catch (error) {
      throw new Error(
        `Failed to get mentor time-based revenue: ${
          error instanceof Error ? error.message : " "
        }`
      );
    }
  }
}
export default new RevenueRepository();
