import { IMessage } from "peer";
import { IMeetusecase } from "../../domain/interface/ImessageUsecase";
import { IRmetting } from "../../domain/repository/Imeeting.repository";
import IUserReposetory from "../../domain/repository/IUser.repository";
import { MeetingDto } from "../dtos/MeetingDto";
import { userError } from "./enum/User";
import { FilterQuery, Types } from "mongoose";
import { IUserModel } from "../../infra/database/models/User";

class MeetingUsecase implements IMeetusecase {
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
    filter: FilterQuery<IUserModel>,
    sortBy?: FilterQuery<IUserModel>
  ): Promise<{ total: number; data: MeetingDto[] }> {
    const match: FilterQuery<IUserModel> = {
      mentorId: new Types.ObjectId(mentorId),
    };

    if (filter.search) {
      match["user.name"] = { $regex: filter.search, $options: "i" };
    }
    if (filter.status) {
      match["status"] = filter.status;
    }
 

    const sort = sortBy?.sortOrder === "desc" ? -1 : 1;
    return await this.MeetingRepo.getAllmeeting(page, limit, match, sort);
  }

  async fetchMeetmyId(meetid: string): Promise<MeetingDto | null> {
    const data = await this.MeetingRepo.getMeetingByid(meetid);
 

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
 
    
    if (!meet) {
      throw new Error("Meet Not find");
    }
 

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
