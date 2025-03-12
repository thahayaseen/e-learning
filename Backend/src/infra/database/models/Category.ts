import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ICategory extends Document {
  _id: ObjectId;
  Category: String | null;
  CoursesId: ObjectId | null;
  Description: String | null;
  UpdatedAt: Date | null;
  CreatedAt: Date | null;
}

const CategorySchema: Schema = new Schema({
  Category: { type: String },
  CoursesId: { type: Schema.Types.ObjectId,ref:"Courses" },
  Description: { type: String },
  
},{timestamps:true});

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

