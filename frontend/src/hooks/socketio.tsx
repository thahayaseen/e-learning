"use client";
import { addNotification } from "@/lib/features/message";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Socket, io } from "socket.io-client";
export const useSocket = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const instens = io(process.env.NEXT_PUBLIC_DOMAIN);
    setSocket(instens);
    instens.on("receiveNotification", (data) => {
      dispatch(addNotification(data));
    });
    instens.on("connect", () => {
     });
    return () => {
      instens.off("receiveNotification");
      // instance.disconnect();
      instens.disconnect();
    };
  }, [dispatch]);
  return socket;
};
