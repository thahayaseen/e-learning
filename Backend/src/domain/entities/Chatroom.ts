import { IMessage } from "./Message";

export interface IChatroom {

    type: "group" | "private";
    
    lastMessage?: IMessage;
    courseId:string,
    mentorId:string,
    userId:string

  }
  