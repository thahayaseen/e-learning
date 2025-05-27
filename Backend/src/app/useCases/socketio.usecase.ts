import { string } from "zod";
import { IChatroom } from "../../domain/entities/Chatroom";
import { IMessage } from "../../domain/entities/Message";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import IsocketUsecase from "../../domain/interface/socket";
import { IRchatroom } from "../../domain/repository/Ichatroom.repository";
import { IRmessage } from "../../domain/repository/Imessage.repository";
import { getChatroom } from "../../infra/repositories/chatroom.repository";
import { IMeetusecase } from "../../domain/interface/ImessageUsecase";

export class SocketuseCase implements IsocketUsecase {
  constructor(
    private chatroomRepo: IRchatroom,
    private MessageRepo: IRmessage,
    private userUsecase: IuserUseCase,
    private ChatroomUsecase: IRchatroom,
    private MeetinguseCase: IMeetusecase
  ) {}
  async StartMessage(
    mentorId: string,
    userId: string,
    courseid: string
  ): Promise<string> {
    return await this.chatroomRepo.createChatroom(userId, mentorId, courseid);
  }
  async getAllroomsByid(Roomid: string, page: number): Promise<getChatroom> {
    const chats = await this.chatroomRepo.getAllRoombyuid(Roomid, page);
    if (!chats) {
      throw new Error("Room not found");
    }
    return chats;
  }
  async sendMessage(
    Roomid: string,
    userEmail: string,
    message: string,
    username: string
  ): Promise<IMessage> {
    const user = await this.userUsecase.UseProfileByemail(userEmail);
    if (!user || !user._id) {
      throw new Error("user Not found");
    }
 
    if (user.isBlocked) {
      throw new Error("User is blocked");
    }
    const room = await this.chatroomRepo.findByRoomid(Roomid);
    const lastmsg = await this.MessageRepo.createMessage(
      String(user._id),
      message,
      Roomid,
      username
    );
 
    if (room?.mentorId == user._id) {
      await this.chatroomRepo.updateLastchatByid(Roomid, lastmsg);
    }

    return lastmsg;
  }
  async findByusers(data: {
    userid: string;
    mentorid: string;
  }): Promise<IChatroom | null> {
    const res = await this.chatroomRepo.findByuserid(data);

    return res;
  }
  async validatoinUser(roomid: string, email: string): Promise<boolean> {
    const user = await this.userUsecase.UseProfileByemail(email);
 

    const room: any = await this.ChatroomUsecase.findByRoomid(roomid);
 
    if (!room || !room.userId || !user || !user._id) {
      return false;
    }
    const validatiuon =
      String(room.userId) == String(user._id) ||
      String(room.mentorId._id) == String(user._id);

 

    if (validatiuon) {
      return true;
    }
    return false;
  }
  async findChatwithroom(roomid: string): Promise<IChatroom | null> {
    return await this.chatroomRepo.findByRoomid(roomid);
  }
  async getAllmessageByroom(roomid: string): Promise<IMessage[]> {
    return await this.MessageRepo.getallmessages(roomid);
  }
  async valiateMeeting(room: string, email: string): Promise<boolean> {
 

    const result = await this.MeetinguseCase.fetchMeetmyId(room);
 

    if (!result) {
 

      return false;
    }
    const user = await this.userUsecase.UseProfileByemail(email);
 

    if (!user || !user._id) {
      return false;
    }
 

    const res =
      String(result.mentorId) == user._id || String(result.userId) == user._id;
    return res;
  }
}
