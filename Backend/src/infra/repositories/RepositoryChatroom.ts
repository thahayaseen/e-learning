import { IChatroom } from "../../domain/entities/Chatroom";
import { IMessage } from "../../domain/entities/Message";
import { IRchatroom } from "../../domain/repository/IRchatroom";
import Chatroom from "../database/models/Chatroom";
export interface getChatroom{
  data:IChatroom[],
  total:number
}
export class ChatroomRepository implements IRchatroom {
  async createChatroom(
    UserId: string,
    MentorId: string,
    courseid: string
  ): Promise<string> {
    const roomid = await Chatroom.create({
      mentorId: MentorId,
      userId: UserId,
      courseId: courseid,
    });
    return String(roomid._id);
  }
  async getAllRoombyuid(userid: string,page:number): Promise< getChatroom| null> {
    const limit=10
    const skip=(page-1)*limit
    const data= await Chatroom.find({ mentorId: userid }).populate("userId").skip(skip).limit(limit)
    const total=await Chatroom.find({ mentorId: userid }).countDocuments()
    return {data,total}
  }
  async findByuserid(data: {
    userid: string;
    mentorid: string;
  }): Promise<IChatroom | null> {
    const dat = await Chatroom.findOne({
      userId: data.userid,
      mentorId: data.mentorid,
    });
    console.log(dat);

    return dat;
  }
  async findByRoomid(roomid: string): Promise<IChatroom | null> {
    console.log(roomid, "roomiid ");

    const dat = await Chatroom.findOne({ _id: roomid });
    console.log(dat, "dagd");

    return dat;
  }
  async updateLastchatByid(roomid: string, data: IMessage): Promise<void> {

     
    await Chatroom.findByIdAndUpdate(roomid,data)
      return 
  }
}
