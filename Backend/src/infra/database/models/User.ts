import mongoose, { Document } from "mongoose";
import IUser from "../../../domain/entities/UserSchema";

export interface IUserModel extends Document, IUser {}
const Profile = new mongoose.Schema({
  avatar: String,
  experience: Number,
  social_link: String,
  userid: String,
  
});

export const User = new mongoose.Schema<IUserModel>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    profile: Profile,
    username: {
      type: String,
      unique: true,
    },
    gid: String,
    email: String,
    password: String,
    verified: { type: Boolean, default: false },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "student", "mentor"],
      required: true,
    },
    updatedAt: {
      type: Date,
    },
    purchasedCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Courses" },
    ],
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  },
  { timestamps: true }
);
export default mongoose.model("User", User);
