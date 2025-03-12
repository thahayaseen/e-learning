import { Server } from "socket.io";
import http from "http";
import handleSocket from "./sockethandle/socket";
import { socketusecases } from "../config/dependencies";

export function socketconfig(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });
  io.on("connection", (socket) => {
    console.log("connected success fully", socket.id);

    const handlesocket = new handleSocket(io, socketusecases);
    handlesocket.registerEvent(socket);
  });
}
