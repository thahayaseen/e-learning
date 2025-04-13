import { CertificateDTO } from "../../app/dtos/Certificate";
import { ICertificaterepository } from "../../domain/repository/Icertificate.repository";
import Certificate from "../database/models/certificate";

class CertificateRepo implements ICertificaterepository {
  async createCertificate(
    student_id: string,
    student_name: string,
    course_id: string,
    course_name: string,
    category: string,
    completed_date: Date
  ): Promise<CertificateDTO> {
    console.log(
      student_id,
      student_name,
      course_id,
      course_name,
      category,
      completed_date,
      'coursedatais'
    );

    return (await Certificate.create({
      student_id,
      student_name,
      course_id,
      course_name,
      category,
      completed_date,
    })) as CertificateDTO;
  }
  async getCertificate(certificateId: string): Promise<CertificateDTO> {
    const res: CertificateDTO | null = await Certificate.findById(
      certificateId
    );
    if (!res) {
      throw new Error("cannot find the certificate");
    }
    return res;
  }
}
export default new CertificateRepo();
