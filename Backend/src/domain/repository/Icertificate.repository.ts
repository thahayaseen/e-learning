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
}
