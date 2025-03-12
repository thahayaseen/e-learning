import { Server, Socket } from "socket.io";
import IsocketUsecase from "../../domain/interface/socket";
import { chatEnum } from "../../app/useCases/enum/chatEnum";

export default class HandleSocket {
  constructor(private io: Server, private socketusecase: IsocketUsecase) {}

  public registerEvent(socket: Socket) {
    socket.on(
      chatEnum.joinRoom,
      async (room: { roomId: string; username: string; email: string }) => {
        try {
          console.log("Joining room:", room);
          const res = await this.socketusecase.validatoinUser(
            room.roomId,
            room.email
          );
          console.log(res);
          if (res) {
            this.handleJoinRoom(socket, room);
          }else{
            socket.emit(chatEnum.error,"unknow user")
          }
        } catch (error: any) {
          console.error("Error joining room:", error);
          socket.emit(chatEnum.error, error.message || "An error occurred");
        }
      }
    );
  }

  private handleJoinRoom(
    socket: Socket,
    room: { roomId: string; username: string }
  ): void {
    try {
      socket.join(room.roomId);
      console.log(`User ${room.username} joined room: ${room.roomId}`);

      socket.on(
        chatEnum.sendMessage,
        (
          message: string,
          roomId: string,
          userEmail: string,
          username: string
        ) =>
          this.handleSendMessage(socket, {
            roomId,
            message,
            userEmail,
            username,
          })
      );
    } catch (error: any) {
      console.error("Error in handleJoinRoom:", error);
      socket.emit(chatEnum.error, error.message || "Failed to join room");
    }
  }

  private async handleSendMessage(
    socket: Socket,
    {
      roomId,
      message,
      userEmail,
      username,
    }: { roomId: string; message: string; userEmail: string; username: string }
  ): Promise<void> {
    try {
      console.log(`Sending message in room ${roomId}: ${message}`);
      console.log(roomId);
      
      const savedMessage = await this.socketusecase.sendMessage(
        roomId,
        userEmail,
        message,
        username
      );

      this.io.to(roomId).emit(chatEnum.receive, savedMessage);
      console.log(`Message delivered to room ${roomId}:`, savedMessage);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      socket.emit(chatEnum.error, error.message || "Failed to send message");
    }
  }
}
