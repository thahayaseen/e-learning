import app from "./express";
import { socketconfig } from "./socket";
import http from 'http'
export const server=http.createServer(app)
socketconfig(server)