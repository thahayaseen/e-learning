import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["inr", "usd"],
      default: "inr",
    },
    planType: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const OrderSchemas = mongoose.model("Order", OrderSchema);
