import mongoose, { Document, Schema } from "mongoose";
import { IMessage } from "../../../domain/entities/Message";
interface MessageDocument extends IMessage, Document {}
const MessageSchema = new Schema(
  {
    chatroomId: {
      type: Schema.Types.ObjectId,
      ref: "Chatroom",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    message: String,
    username:String
  },
  { timestamps: true }
);
export default mongoose.model<MessageDocument>("Message", MessageSchema);
