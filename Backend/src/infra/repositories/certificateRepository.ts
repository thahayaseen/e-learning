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
      "coursedatais"
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
  async getAllcertificate(
    studentid: string,
    page: number = 1,
    limit: number = 5,
    search?: string
  ): Promise<{ data: CertificateDTO[]; total: number }> {
    const skip = (page - 1) * limit;
console.log(skip,limit,page,'all is in here');

    // Build search query
    const query: any = {
      student_id: studentid,
    };

    if (search) {
      // Assuming you're searching within course_name or similar fields
      query.$or = [
        { course_name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Get data and total count in parallel
    const [data, total] = await Promise.all([
      Certificate.find(query).skip(skip).limit(limit).lean().exec() as Promise<
        any[]
      >,
      Certificate.countDocuments(query),
    ]);

    if (!data) {
      throw new Error("Cannot find certificates");
    }
console.log(data,'anss is ');

    return {
      data ,
      total,
    };
  }

  async GetCertificateByCourseid(
    studentid: string,
    courseid: string
  ): Promise<CertificateDTO|null> {
    const res: CertificateDTO | null = await Certificate.findOne({
      student_id: studentid,
      course_id: courseid,
    });
 
    return res;
  }
}
export default new CertificateRepo();
