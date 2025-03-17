import { string } from "zod";
import { IChatroom } from "../../domain/entities/Chatroom";
import { IMessage } from "../../domain/entities/Message";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import IsocketUsecase from "../../domain/interface/socket";
import { IRchatroom } from "../../domain/repository/IRchatroom";
import { IRmessage } from "../../domain/repository/IRmessage";
import { getChatroom } from "../../infra/repositories/RepositoryChatroom";
import { ImessageUsecase } from "../../domain/interface/ImessageUsecase";

export class SocketuseCase implements IsocketUsecase {
  constructor(
    private chatroomRepo: IRchatroom,
    private MessageRepo: IRmessage,
    private userUsecase: IuserUseCase,
    private ChatroomUsecase: IRchatroom,
    private MeetinguseCase: ImessageUsecase
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
    console.log("suuuuuuuuu");

    const room = await this.chatroomRepo.findByRoomid(Roomid);
    const lastmsg = await this.MessageRepo.createMessage(
      String(user._id),
      message,
      Roomid,
      username
    );
    console.log("last message is ");
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
    console.log(user);

    const room = await this.ChatroomUsecase.findByRoomid(roomid);
    console.log(room, "roomsis");
    if (!room || !room.userId || !user || !user._id) {
      return false;
    }
    const validatiuon =
      String(room.userId) == String(user._id) ||
      String(room.mentorId) == String(user._id);

    console.log(validatiuon, "validation result is ");

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
    console.log('in herefindihg room,',room,email);
    
    const result = await this.MeetinguseCase.fetchMeetmyId(room);
    console.log(result);
    
    if(!result){
      console.log('no result found',result);
      
      return false
    }
    const user = await this.userUsecase.UseProfileByemail(email);
    console.log(result,'result',user,'useris');
    
    if (!user || !user._id) {
      return false;
    }
    console.log(result.participants,user._id);
    
    const res = String(result.mentorId)==user._id||String(result.userId)==user._id
    return res;
  }
}
