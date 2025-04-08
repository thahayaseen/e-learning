import { IMessage } from "peer";
import { MeetingDto } from "../../app/dtos/MeetingDto";
import { IRmetting } from "../../domain/repository/IRmeeting";
import { Meeting } from "../database/models/meeting";

class RepositoryMeeting implements IRmetting {
  async getMeetingUByid(
    userid: string,
    courseid: string
  ): Promise<MeetingDto | null> {
    console.log(userid, courseid, "all data is");

    return await Meeting.findOne({ userId: userid, courseId: courseid });
  }
  async createMeeting(data: MeetingDto): Promise<void> {
    await Meeting.create(data);
    return;
  }
  async updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "canceled"|"completed"
  ): Promise<void> {
    await Meeting.findByIdAndUpdate(id, { $set: { status } });
    return;
  }
  async getAllmeeting(
    page: number,
    limit: number,
    filter: object,
    sortBy: any
  ): Promise<{ total: number; data: any[] }> {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      { $match: filter },
      {
        $project: {
          _id: 1,
          userId: 1,
          courseId: 1, // keep original ObjectId field
          date: 1,
          time: 1,
          status: 1,
          scheduledTime: 1,
          createdAt: 1,
          // user fields
          "user._id": 1,
          "user.name": 1,
          // course fields from joined doc
          "course._id": 1,
          "course.Title": 1,
        },
      },
      { $sort: { "user.name": sortBy } },
      { $skip: skip },
      { $limit: limit },
    ];
    
    console.log(pipeline, "pipleinedd");

    const countPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: filter },
      { $count: "total" },
    ];

    const [data, totalResult] = await Promise.all([
      Meeting.aggregate(pipeline),
      Meeting.aggregate(countPipeline),
    ]);
    console.log(data, "data is ");

    const total = totalResult[0]?.total || 0;
    return { data, total };
  }

  async updateMeetingTime(id: string, scheduledTime: Date): Promise<void> {
    console.log(id,scheduledTime,'updatedddd');
    
    await Meeting.findByIdAndUpdate(id, { scheduledTime: scheduledTime });
  }
  async getMeetingByid(meetId: string): Promise<MeetingDto | null> {
    try {
      console.log(meetId, "meet id is");

      return await Meeting.findOne({ _id: meetId });
    } catch (error: any) {
      return null;
    }
  }
  async addUserindrepo(
    roomid: string,
    userid: string
  ): Promise<MeetingDto | null> {
    console.log(roomid, userid);

    return await Meeting.findByIdAndUpdate(
      roomid,
      { $addToSet: { participants: userid } },
      { new: true } // Ensures it returns the updated document
    );
  }

  async removeUser(roomid: string, userid: string): Promise<MeetingDto | null> {
    console.log(roomid, userid);

    return await Meeting.findByIdAndUpdate(
      roomid,
      {
        $pull: { participants: userid },
      },
      { new: true }
    );
  }
}
export default new RepositoryMeeting();
