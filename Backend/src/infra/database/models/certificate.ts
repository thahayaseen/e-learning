// Schema for Certificates
import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { CertificateDTO } from "../../../app/dtos/Certificate";

export interface ICertificate extends Document, Omit<CertificateDTO, "_id"> {}

const CertificateSchema: Schema = new Schema({
  student_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  student_name: { type: String, required: true },
  course_id: { type: Schema.Types.ObjectId, required: true, ref: "Courses" },
  course_name: { type: String, required: true },
  category: { type: String, required: true },
  completed_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

const Certificate = mongoose.model<ICertificate>(
  "Certificate",
  CertificateSchema
);

export default Certificate;
