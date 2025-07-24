  import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ILesson extends Document {
  Lessone_name: String | null;
  Content: String | null;
  Task: string[] | null;
  Course_id: ObjectId;
  _id: ObjectId;
}

const LessonSchema: Schema = new Schema({
  Lessone_name: { type: String },
  Content: { type: String },
  Course_id: { type: Schema.ObjectId, ref: "Courses" },
  Task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
