import { model, Schema, Types, Document } from "mongoose";
export interface IReview extends Document {
  user_id: Types.ObjectId;
  courseId: Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;

  helpful_count?: number; // Optional field to track how many users found the review helpful
  reported?: boolean; // Optional field to track if the review has been reported

  createdAt?: Date;
  updatedAt?: Date;
}
const ReviewSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    helpful_count: {
      type: Number,
    },
  },
  { timestamps: true }
);
export default model<IReview>("Review", ReviewSchema);
