import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Common interface for all tasks
export interface ITask extends Document {
  Type: "Quiz" | "Assignment" | "Video";
  Lesson_id: ObjectId;
}

// Quiz task interface
interface IQuizTask extends ITask {
  Question: string;
  Options: string[];
  Answer: string;
}

// Assignment task interface
interface IAssignmentTask extends ITask {
  Description: string;
}

// Video task interface
interface IVideoTask extends ITask {
  VideoURL: string;
}

// Base Task Schema
const TaskSchema: Schema = new Schema({
  Type: { type: String, enum: ["quiz", "assignment", "video"], required: true },
  // Lesson_id: { type: Schema.Types.ObjectId, ref: "Lesson", required: false }
}, { discriminatorKey: "Type" });

// Quiz Schema
const QuizTaskSchema = new Schema({
  Question: { type: String, required: true },
  Options: [{ type: String, required: true }],
  Answer: { type: String, required: true }
});

// Assignment Schema
const AssignmentTaskSchema = new Schema({
  Description: { type: String, required: true }
});

// Video Schema
const VideoTaskSchema = new Schema({
  VideoURL: { type: String, required: true }
});

// Create base model
const Task = mongoose.model<ITask>("Task", TaskSchema);

// Create discriminators
const QuizTask = Task.discriminator<IQuizTask>("Quiz", QuizTaskSchema);
const AssignmentTask = Task.discriminator<IAssignmentTask>("Assignment", AssignmentTaskSchema);
const VideoTask = Task.discriminator<IVideoTask>("Video", VideoTaskSchema);

export { Task, QuizTask, AssignmentTask, VideoTask };
