import express from "express";

import morgan from "morgan";
import dotenv from "dotenv";
import cores from "cors";
import path from "path";
import cookieparser from "cookie-parser";
import router from "./router";
export const app = express();
dotenv.config();
app.use(morgan("dev"))
app.use(express.static(path.join(__dirname,'public')))
app.use(
  cores({
    origin: ["http://172.16.1.135:3000","http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieparser());
app.use('/',router)
export default app