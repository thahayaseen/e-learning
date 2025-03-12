  import { Document, Schema, model } from "mongoose";
  import { IChatroom } from "../../../domain/entities/Chatroom";
import { string } from "zod";
  interface IRChatroomShema extends IChatroom, Document {}
  const ChatroomSchema = new Schema({
    type: { type: String, enum: ["group", "private"],default:'private' },
  
    mentorId:{type:Schema.Types.ObjectId,res:"User"},
    userId:{type:Schema.Types.ObjectId,ref:"User"},
    lastMessage: {
      message: String,
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt:Date
    },
    courseId:{type:String,ref:'Courses'}
  },{timestamps:true});


  export default model<IRChatroomShema>('Chatroom',ChatroomSchema)