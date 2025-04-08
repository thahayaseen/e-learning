import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ITaskProgress {
  Task_id: string;
  userid: string;
  Completed?: boolean;
  response?: string;
  Score?: number; // For quizzes
  WatchTime?: number; // For videos
  Status?: "Not Started" | "In Progress" | "Completed"; // Optional status
}

export interface ILessonProgress {
  Lesson_id: string;
  Completed?: boolean;
  WatchTime?: number;

  Task_progress: ITaskProgress[]; // Array of task progress
}

export interface IProgressCollection {
  Student_id: string;
  Course_id: string;
  lesson_progress: ILessonProgress[];
  UpdatedAt?: Date;
  CreatedAt?: Date;
  OverallScore?: number; // Overall score for the course
}

interface IProgressCollectionSchema extends IProgressCollection, Document {}

const TaskProgressSchema: Schema = new Schema({
  Task_id: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userid: { type: Schema.Types.ObjectId, ref: "User" },
  Completed: { type: Boolean, default: false },
  response: { type: String },
  WatchTime: { type: Number }, // For videos
  Status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started",
  },
});

const LessonProgressSchema: Schema = new Schema({
  Lesson_id: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  Completed: { type: Boolean, default: false },
  WatchTime: { type: Number, default: 0 },
  Task_progress: [TaskProgressSchema], // Array of task progress
});

const ProgressCollectionSchema: Schema = new Schema({
  Student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  Course_id: { type: Schema.Types.ObjectId, ref: "Courses", required: true },
  lesson_progress: [LessonProgressSchema],
  UpdatedAt: { type: Date, default: Date.now },
  CreatedAt: { type: Date, default: Date.now },
  OverallScore: { type: Number, default: 0 }, // Overall score for the course
});

const ProgressCollection = mongoose.model<IProgressCollectionSchema>(
  "ProgressCollection",
  ProgressCollectionSchema
);

export default ProgressCollection;
