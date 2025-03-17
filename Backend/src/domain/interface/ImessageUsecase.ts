import { IMessage } from "peer";
import { MeetingDto } from "../../app/dtos/MeetingDto";

export interface ImessageUsecase {
  create(data: MeetingDto): Promise<void>;
  updateMeetTime(meetId: string, scheduledTime: Date): Promise<void>;

  updateSatus(
    Meetid: string,
    status: "pending" | "approved" | "rejected" | "canceled"
  ): Promise<void>;
  fetchallMeetsBymentorid(mentorId: string): Promise<MeetingDto[]>;
  getMeetByuserid(userid: string,courseid:string): Promise<MeetingDto|null>;
  fetchMeetmyId(meetid: string): Promise<MeetingDto|null>
  addUsertomeet(roomid:string,userid:string): Promise<MeetingDto|null>
  leaveFrommeet(roomid:string,userid:string): Promise<MeetingDto|null>
}
