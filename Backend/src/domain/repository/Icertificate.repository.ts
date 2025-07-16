import { Types } from "mongoose";
import { CertificateDTO } from "../../app/dtos/Certificate";

export interface ICertificaterepository {
  createCertificate(
    student_id: Types.ObjectId,
    student_name: string,
    course_id: Types.ObjectId,
    course_name: string,
    category: string,
    completed_date: Date
  ): Promise<CertificateDTO>;
  getCertificate(certificateId: string): Promise<CertificateDTO>;
  GetCertificateByCourseid(
    studentid: Types.ObjectId,
    courseid: Types.ObjectId
  ): Promise<CertificateDTO | null>;
  getAllcertificate(
    studentid: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ data: CertificateDTO[]; total: number }>;
}
