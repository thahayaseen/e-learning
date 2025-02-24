import dotenv from "dotenv";

dotenv.config();

export default {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "thajayaseenvalappil@gmail.com",

    pass: process.env.MAILPASS,
  },
};

