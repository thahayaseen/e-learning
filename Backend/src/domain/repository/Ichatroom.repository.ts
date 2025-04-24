import { getChatroom } from "../../infra/repositories/chatroom.repository";
import { IChatroom } from "../entities/Chatroom"
import { IMessage } from "../entities/Message";

export interface IRchatroom{
    createChatroom(UserId:string,MentorId:string,courseid:string):Promise<string>
    getAllRoombyuid(roomId:string,page:number):Promise<getChatroom|null>
    findByuserid(data:{ userid: string; mentorid: string }):Promise<IChatroom|null>
    findByRoomid(roomid:string):Promise<IChatroom|null>
    updateLastchatByid(roomid:string,data:IMessage):Promise<void>
}