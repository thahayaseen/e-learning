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
 
const allowedOrigins = [
  "https://e-learning-phi-five.vercel.app",
  "http://localhost:3000",
  "http://192.168.1.100:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieparser());
app.use("/", router);

export default app;
