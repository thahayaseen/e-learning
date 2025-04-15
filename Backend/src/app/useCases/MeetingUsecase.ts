import { IMessage } from "peer";
import { ImessageUsecase } from "../../domain/interface/ImessageUsecase";
import { IRmetting } from "../../domain/repository/IRmeeting";
import IUserReposetory from "../../domain/repository/IUser";
import { MeetingDto } from "../dtos/MeetingDto";
import { userError } from "./enum/User";
import { Types } from "mongoose";

class MeetingUsecase implements ImessageUsecase {
  constructor(
    private MeetingRepo: IRmetting // private userRepo: IUserReposetory
  ) {}
  async create(data: MeetingDto): Promise<void> {
    await this.MeetingRepo.createMeeting(data);
  }
  async fetchallMeetsBymentorid(
    mentorId: string,
    page: number,
    limit: number,
    filter: any,
    sortBy?: any
  ): Promise<{ total: number; data: MeetingDto[] }> {
    const match: any = {
      mentorId: new Types.ObjectId(mentorId),
    };

    if (filter.search) {
      match["user.name"] = { $regex: filter.search, $options: "i" };
    }
    if (filter.status) {
      match["status"] = filter.status;
    }
    console.log(match);

    const sort = sortBy?.sortOrder === "desc" ? -1 : 1;
    return await this.MeetingRepo.getAllmeeting(page, limit, match, sort);
  }

  async fetchMeetmyId(meetid: string): Promise<MeetingDto | null> {
    const data = await this.MeetingRepo.getMeetingByid(meetid);
    console.log(data);

    return data;
  }
  async getMeetByuserid(
    userid: string,
    courseid: string
  ): Promise<MeetingDto | null> {
    return await this.MeetingRepo.getMeetingUByid(userid, courseid);
  }
  async updateMeetTime(meetId: string, scheduledTime: Date): Promise<void> {
    return await this.MeetingRepo.updateMeetingTime(meetId, scheduledTime);
  }
  async updateSatus(
    Meetid: string,
    status: "pending" | "approved" | "rejected" | "canceled" | "completed",
    mentorid: string
  ): Promise<void> {
    const meet = await this.MeetingRepo.getMeetingByid(Meetid);
    console.log('fasdafsdafsd');
    
    if (!meet) {
      throw new Error("Meet Not find");
    }
    console.log(String(meet.mentorId), mentorid, "meet data is ");

    if (String(meet.mentorId) !== String(mentorid)) {
      throw new Error(userError.Unauthorised);
    }
    await this.MeetingRepo.updateStatus(Meetid, status);
    return;
  }
  async addUsertomeet(
    roomid: string,
    userid: string
  ): Promise<MeetingDto | null> {
    return await this.MeetingRepo.addUserindrepo(roomid, userid);
  }
  async leaveFrommeet(
    roomid: string,
    userid: string
  ): Promise<MeetingDto | null> {
    return await this.MeetingRepo.removeUser(roomid, userid);
  }
}
export default MeetingUsecase;
