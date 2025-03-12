import { IMessage } from "../entities/Message";

export interface IRmessage {
  createMessage(
    UserId: string,
    message: string,
    roomId: string,
    username: string
  ): Promise<IMessage>;

  getallmessages(roomid: string): Promise<IMessage[]>;
}
