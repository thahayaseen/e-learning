import mongoose, { Schema, Document, ObjectId } from "mongoose";
export interface IProgressCollection {
  Student_id: string ;
  Course_id: string | null;
  lesson_progress: {
    Completed?: boolean | null;
    Lesson_id: string | null;
    WatchTime?: number | null;
  }[];
  UpdatedAt?: Date | null;
  CreatedAt?: Date | null;
  Score?: number | null;
}
 interface IProgressCollectionSchema
  extends IProgressCollection,
    Document {}

const ProgressCollectionSchema: Schema = new Schema({
  Student_id: { type: Schema.Types.ObjectId, ref: "Student" },
  Course_id: { type: Schema.Types.ObjectId, ref: "Courses" },
  lesson_progress: [
    {
      Completed: { type: Boolean, default: false },
      Lesson_id: { type: Schema.Types.ObjectId, ref: "Lesson" },
      WatchTime: { type: Number, default: 0 },
    },
  ],
  UpdatedAt: { type: Date, default: Date.now },
  CreatedAt: { type: Date, default: Date.now },
  Score: { type: Number, default: 0 },
});

const ProgressCollection = mongoose.model<IProgressCollectionSchema>(
  "ProgressCollection",
  ProgressCollectionSchema
);

export default ProgressCollection;
