import { getChatroom } from "../../infra/repositories/chatroom.repository";
import { IChatroom } from "../entities/Chatroom";
import { IMessage } from "../entities/Message";

export default interface IsocketUsecase {
  StartMessage(
    mentorId: string,
    userId: string,
    courseid: string
  ): Promise<string>;
  getAllroomsByid(Roomid: string, page: number): Promise<getChatroom>;
  sendMessage(
    Roomid: string,
    userId: string,
    message: string,
    username: string
  ): Promise<IMessage>;
  findByusers(data: { userid: string; mentorid: string }): Promise<any | null>;
  validatoinUser(roomid: string, email: string): Promise<boolean>;
  findChatwithroom(roomid: string): Promise<IChatroom | null | any>;
  getAllmessageByroom(roomid: string): Promise<IMessage[]>;
  valiateMeeting(room: string, userId: string): Promise<boolean>;
}
