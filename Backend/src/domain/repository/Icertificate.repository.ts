import { CertificateDTO } from "../../app/dtos/Certificate";

export interface ICertificaterepository {
  createCertificate(
    student_id: string,
    student_name: string,
    course_id: string,
    course_name: string,
    category: string,
    completed_date: Date
  ): Promise<CertificateDTO>;
  getCertificate(certificateId: string): Promise<CertificateDTO>;
  GetCertificateByCourseid(
    studentid: string,
    courseid: string
  ): Promise<CertificateDTO | null>;
  getAllcertificate(
    studentid: string,
    page: number,
    limit: number,
    search: any
  ): Promise<{ data: CertificateDTO[]; total: number }>;
}
