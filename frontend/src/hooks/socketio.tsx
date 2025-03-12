"use client";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const instens = io(process.env.NEXT_PUBLIC_DOMAIN);
    setSocket(instens);

    instens.on("connect", () => {
      console.log("connected edd");
    });
    return () => {
      instens.disconnect();
    };
  }, []);
  return socket;
};
