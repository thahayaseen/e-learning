import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors"; // ✅ fixed import here
import path from "path";
import cookieparser from "cookie-parser";
import router from "./router";

export const app = express();
dotenv.config();

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
 

app.use(
  cors({
    origin:
     process.env.NEXT_PUBLIC_SERVER,
    
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieparser());
app.use("/", router);

export default app;
