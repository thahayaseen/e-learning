"use client";

import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

import { addNotification } from "@/lib/features/message";
import { useSocket } from "@/hooks/socketio";

function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const dispatch = useDispatch();
  useEffect(() => {
    // Listen for admin notifications
    if (!socket) return;
    console.log(socket, "soketis ");

    socket.on("adminNotification", (data) => {
      console.log("got message", data);

      dispatch(addNotification(data));
    });

    // Listen for direct messages
    socket.on("receiveMessage", (data) => {
      dispatch(
        addNotification({
          type: "message",
          message: `New Message: ${data.message}`,
        })
      );
    });

    return () => {
      socket.off("adminNotification");
      socket.off("receiveMessage");
    };
  }, [dispatch, socket]);

  return <>{children}</>;
}

export default function Layout({ children }: { children: ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
