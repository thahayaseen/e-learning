import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Room ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "canceled","completed"],
    default: "pending",
  },
  scheduledTime: { type: Date },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Admin/Mentor/User
  createdAt: { type: Date, default: Date.now },
});

export const Meeting = mongoose.model("Meeting", meetingSchema);
