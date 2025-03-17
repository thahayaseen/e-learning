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
    status: "pending" | "approved" | "rejected" | "canceled"
  ): Promise<void> {
    await Meeting.findByIdAndUpdate(id, { $set: { status } });
    return;
  }
  async getAllmeeting(mentorId: string): Promise<MeetingDto[]> {
    return await Meeting.find({ mentorId: mentorId });
  }
  async updateMeetingTime(id: string, scheduledTime: Date): Promise<void> {
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
    console.log(roomid,userid);
    
    return await Meeting.findByIdAndUpdate(
      roomid,
      { $addToSet: { participants: userid } },
      { new: true } // Ensures it returns the updated document
    );
  }
  
  async removeUser(roomid: string, userid: string): Promise<MeetingDto | null> {

    console.log(roomid,userid);
    
    return await Meeting.findByIdAndUpdate(roomid, {
    $pull: { participants: userid }},{new:true}
    );
  }
}
export default new RepositoryMeeting();
