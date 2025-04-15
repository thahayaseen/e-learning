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
console.log("after");

app.use(
  cors({
    origin: [
      "https://e-learning-git-main-thahayaseens-projects.vercel.app",
      "http://localhost:3000",
      "https://e-learning-phi-five.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieparser());
app.use("/", router);

export default app;
