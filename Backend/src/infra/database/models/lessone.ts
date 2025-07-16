  import mongoose, { Document,  Schema,  Types } from "mongoose";
import { ITask } from "./tasks";

export interface ILesson extends Document {
  Lessone_name: Types.ObjectId|String | null;
  Content: String | null;
  Task: ITask[] ;
  Course_id: Types.ObjectId;
  _id: Types.ObjectId;
}

const LessonSchema: Schema = new Schema({
  Lessone_name: { type: String },
  Content: { type: String },
  Course_id: { type: Schema.ObjectId, ref: "Courses" },
  Task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
