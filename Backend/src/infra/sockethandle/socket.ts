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
          } else {
            socket.emit(chatEnum.error, "unknow user");
          }
        } catch (error: any) {
          console.error("Error joining room:", error);
          socket.emit(chatEnum.error, error.message || "An error occurred");
        }
      }
    );
    socket.on(chatEnum.joinmeet, async (room, email, username) => {
      try {
        console.log("inhere");

        const ans = await this.socketusecase.valiateMeeting(room, email);
        console.log(ans, "res");

        if (!ans) {
          socket.emit(chatEnum.error, "Unable to varify ");
        } else {
          this.handleJoinRoom(socket, { roomId: room, username, email });
        }
      } catch (error) {}
    });
  }

  handleJoinRoom(
    socket: Socket,
    room: { roomId: string; username: string; email: string }
  ): void {
    try {
      console.log(
        `User ${room.username} is trying to join room: ${room.roomId}`
      );

      socket.join(room.roomId); // ✅ Ensure user joins first

      console.log(`User ${room.username} joined room: ${room.roomId}`);

      // ✅ Send "userConnected" event to everyone EXCEPT the sender
      socket.broadcast.to(room.roomId).emit(chatEnum.userConnected, {
        email: room.email,
        id: socket.id,
        message: `${room.username} Joined `,
      });

      this.handleVidoconnection(socket, room);

      socket.on(
        chatEnum.sendMessage,
        (
          message: string,
          roomId: string,
          userEmail: string,
          username: string
        ) => {
          this.handleSendMessage(socket, {
            roomId,
            message,
            userEmail,
            username,
          });
        }
      );
    } catch (error: unknown) {
      console.error("Error in handleJoinRoom:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to join room";
      socket.emit(chatEnum.error, errorMessage);
    }
  }

  private async handleVidoconnection(
    socket: Socket,
    room: { roomId: string; username: string; email: string }
  ) {
    socket.on(chatEnum.signal, (data) => {
      console.log(data);
    });
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
