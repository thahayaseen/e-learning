import { IMessage } from "peer";
import { MeetingDto } from "../../app/dtos/MeetingDto";

export interface IRmetting {
  createMeeting(data: MeetingDto): Promise<void>;
  updateMeetingTime(id: string, scheduledTime: Date): Promise<void>;
  updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "canceled"|"completed"
  ): Promise<void>;
  getAllmeeting(
    page: number,
    limit: number,
    filter: object,
    sortBy: any
  ): Promise<{ total: number; data: any[] }>;
  getMeetingUByid(userid: string, courseid: string): Promise<MeetingDto | null>;
  getMeetingByid(meetId: string): Promise<MeetingDto | null>;
  addUserindrepo(roomid: string, userid: string): Promise<MeetingDto | null>;
  removeUser(roomid: string, userid: string): Promise<MeetingDto | null>;
}
