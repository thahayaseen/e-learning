import { IMessage } from "../../domain/entities/Message";
import { IRmessage } from "../../domain/repository/IRmessage";
import Message from "../database/models/Message";


export class MessageRepository implements IRmessage {
  async createMessage(
    UserId: string,
    message: string,
    roomId: string,
    username:string
  ): Promise<IMessage> {
    console.log(username);
    
   return await Message.create({
      chatroomId: roomId,
      userId: UserId,
      message: message,
      username:username
    });
  }
  async getallmessages(roomid:string):Promise<IMessage[]>{
   return Message.find({chatroomId:roomid}).sort({createdAt:1})
  }
}
