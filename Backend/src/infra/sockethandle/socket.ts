import { Server, Socket } from "socket.io";
import IsocketUsecase from "../../domain/interface/socket";
import { chatEnum } from "../../app/useCases/enum/chatEnum";
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default class HandleSocket {
  constructor(private io: Server, private socketusecase: IsocketUsecase) {}

  public registerEvent(socket: Socket) {
    console.log("reached herer");

    socket.on("sendNotification", (data) => {
      this.io.emit("receiveNotification", data);
    });
    socket.on("SubmitForm", (data) => {
      console.log("data is fasd", data);

      this.io.emit("adminNotification", data);
    });
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
          console.log("thisisisis", res);

          if (res) {
            console.log("thisissi");

            this.handleJoinRoom(socket, room);
          } else {
            socket.emit(chatEnum.error, "unknown user");
          }
        } catch (error: any) {
          console.error("Error joining room:", error);
          socket.emit(chatEnum.error, error.message || "An error occurred");
        }
      }
    );

    socket.on(chatEnum.joinmeet, async (room, email, username) => {
      try {
        console.log("inhere", room, email, username);
        const ans = await this.socketusecase.valiateMeeting(room, email);
        console.log(ans, "res");

        if (!ans) {
          socket.emit(chatEnum.error, "Unable to verify");
        } else {
          console.log("in here");

          this.handleJoinRoom(socket, { roomId: room, username, email });
        }
      } catch (error: any) {
        console.error("Error in joinmeet:", error);
        socket.emit(chatEnum.error, error.message || "An error occurred");
      }
    });
  }

  private handleJoinRoom(
    socket: Socket,
    room: { roomId: string; username: string; email: string }
  ): void {
    try {
      console.log(
        `User ${room.username} is trying to join room: ${room.roomId} ${socket.id}`
      );
      socket.on("leave-room", async (data) => {
        // console.log("Total connected clients:", connectedSockets.length);

        socket.leave(data.roomId);
        console.log("User leaving room:", socket.id, data);

        if (room.username) {
          console.log("thisisisisiisis", room.username);

          socket.to(data.roomId).emit("u-disconnect", room.username);
        }
        return;
      });
      socket.join(room.roomId);
      console.log(`User ${room.username} joined room: ${room.roomId}`);
      socket.emit(chatEnum.joined, { id: socket.id, room });

      socket.broadcast.to(room.roomId).emit(chatEnum.userConnected, {
        email: room.email,
        id: socket.id,
        username: room.username,
        message: `${room.username} Joined`,
      });

      console.log("call this ");
      this.handleVidoconnection(socket, room);
      socket.removeAllListeners(chatEnum.sendMessage);
      socket.on(
        chatEnum.sendMessage,
        (
          message: string,
          roomId: string,
          userEmail: string,
          username: string
        ) => {
          console.log(message, "mesis");
          this.handleSendMessage(socket, {
            roomId,
            message,
            userEmail,
            username,
          });
        }
      );

      socket.on("disconnect", () => {
        console.log("User disconnected unexpectedly");
        if (room && room.roomId) {
          socket.to(room.roomId).emit("u-disconnect", room.username);
        }
      });
    } catch (error: any) {
      console.error("Error in handleJoinRoom:", error);
      socket.emit(chatEnum.error, error.message || "Failed to join room");
    }
  }

  private handleVidoconnection(
    socket: Socket,
    room: { roomId: string; username: string; email: string }
  ) {
    console.log("haloo", room);

    socket.on(chatEnum.videoState, (data) => {
      console.log(
        `Video state change from ${room.username}: ${
          data.enabled ? "ON" : "OFF"
        }`
      );
      socket.broadcast.to(room.roomId).emit(chatEnum.videoState, {
        email: room.email,
        username: room.username,
        enabled: data.enabled,
      });
    });

    socket.on(chatEnum.audioState, (data) => {
      console.log(
        `Audio state change from ${room.username}: ${
          data.enabled ? "ON" : "OFF"
        }`
      );
      socket.broadcast.to(room.roomId).emit(chatEnum.audioState, {
        email: room.email,
        username: room.username,
        enabled: data.enabled,
      });
    });

    socket.on(chatEnum.error, (data) => {
      this.io.to(data.to).emit(chatEnum.error, { message: data.message });
    });

    socket.on(chatEnum.signal, (data) => {
      console.log("Handling signal from", socket.id, "to", data.to);

      if (data.to !== socket.id) {
        this.io.to(data.to).emit(chatEnum.signal, {
          ...data,
          from: socket.id,
        });
      }
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
      console.log(`Sending message in room ${roomId}: ${message}`, socket);

      const savedMessage = await this.socketusecase.sendMessage(
        roomId,
        userEmail,
        message,
        username
      );

      socket.broadcast.to(roomId).emit(chatEnum.receive, savedMessage);
      console.log(`Message delivered to room ${roomId}:`, savedMessage);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      socket.emit(chatEnum.error, error.message || "Failed to send message");
    }
  }
}
