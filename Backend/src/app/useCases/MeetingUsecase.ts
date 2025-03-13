import { ImessageUsecase } from "../../domain/interface/ImessageUsecase";
import { IRmetting } from "../../domain/repository/IRmeeting";
import IUserReposetory from "../../domain/repository/IUser";
import { MeetingDto } from "../dtos/MeetingDto";

class MeetingUsecase implements ImessageUsecase {
  constructor(
    private MeetingRepo: IRmetting
  ) // private userRepo: IUserReposetory
  {}
  async create(data: MeetingDto): Promise<void> {
    await this.MeetingRepo.createMeeting(data);
  }
  async fetchallMeetsBymentorid(mentorId: string): Promise<MeetingDto[]> {
    return await this.MeetingRepo.getAllmeeting(mentorId);
  }
  async fetchMeetmyId(meetid: string): Promise<MeetingDto|null> {
    const data = await this.MeetingRepo.getMeetingByid(meetid);
   console.log(data);
   
    return data;
  }
  async getMeetByuserid(userid: string,courseid:string): Promise<MeetingDto|null> {
    return await this.MeetingRepo.getMeetingUByid(userid,courseid);
 
  }
  async updateMeetTime(meetId: string, scheduledTime: Date): Promise<void> {
    await this.MeetingRepo.updateMeetingTime(meetId, scheduledTime);
  }
  async updateSatus(
    Meetid: string,
    status: "pending" | "approved" | "rejected" | "canceled"
  ): Promise<void> {
    await this.MeetingRepo.updateStatus(Meetid, status);
  }
}
export default MeetingUsecase;
