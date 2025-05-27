import { ObjectId } from "mongoose";

export interface CertificateDTO {
  student_id: string | ObjectId;
  student_name: string;
  course_id: string | ObjectId;
  course_name: string;
  category: string;
  completed_date: Date;
  created_at: Date;
  _id: string | ObjectId;
}
