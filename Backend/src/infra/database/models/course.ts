import mongoose, { Schema, Document, Types } from "mongoose";
import { ILesson } from "./lessone";

export interface ICourses extends Document {
  _id: Types.ObjectId;
  Title: string | null;
  Mentor_id: Types.ObjectId | any | null;
  Description: string | null;
  CreatedAt: Date | null;
  Category: Types.ObjectId | null;
  Price: number | null;
  Approved_by_admin: "pending" | "rejected" | "approved";
  Students_enrolled: Types.ObjectId[] | null;
  UpdatedAt: Date | null;
  image: string;
  lessons: ILesson[];
  Content: string | null;
  Offer_id: Types.ObjectId | null;
  unlist: boolean;
}

const CoursesSchema: Schema = new Schema({
  Title: { type: String, required: true },
  Mentor_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  Description: { type: String },
  CreatedAt: { type: Date, default: Date.now },
  Category: { type: Schema.ObjectId, ref: "Category" },
  Price: { type: Number, required: true },
  Approved_by_admin: {
    type: String,
    enum: ["pending", "rejected", "approved"],
    default: "pending",
  },
  Students_enrolled: [{ type: Schema.Types.ObjectId, ref: "User" }],
  UpdatedAt: { type: Date, default: Date.now },
  image: String,
  unlist: { type: Boolean, default: false },
  lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  Content: { type: String },
  Offer_id: { type: Schema.Types.ObjectId, ref: "Offer" },
  duration: {
    type: Number,
    default: 30000,
  },
});

const Courses = mongoose.model<ICourses>("Courses", CoursesSchema);

export default Courses;
