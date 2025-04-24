import { ImentorRequestRepo } from "../../domain/repository/ImentroRequst.repository";
import MentorRequest from "../database/models/mentorRequest";
export interface Imentorrequst {
  fullname: string;
  userid: string;
  idproof: string;
  mobile: string;
  qualification: string;
  experience: number;
  profileLink: string;
  startTime: string;
  endTime: string;
  profileImage: string;
  status: "pending" | "rejected" | "accepted";
}
export interface alldata {
  data: Imentorrequst[];
  total: number;
}
class Beamentor implements ImentorRequestRepo {
  async addrequest(
    userid: string,
    data: Omit<Imentorrequst, "userid">
  ): Promise<void> {
    await MentorRequest.create({ userid, ...data });
    return;
  }
  async acction(dataid: string, action: string): Promise<Imentorrequst | null> {
    console.log(dataid);

    return await MentorRequest.findByIdAndUpdate(dataid, { status: action });
  }
  async getallReqeust(page: number, filter: any): Promise<alldata> {
    const limit = 10;
    const qury: any = {};
    if (filter.status) qury.status = filter.status;
    if (filter.experience) {
      const nums = filter.experience.split("-");
      console.log(nums);
      const objj = { $gt: nums[0], $lt: nums[1] };
      qury.experience = objj;
    }
    console.log(filter.sort,'now sort is ');
    
    if (filter.search) qury.fullname = { $regex: filter.search, $options: "i" };
    const sort = filter.sort !== "asc" ? -1 : 1;
    console.log(sort,'ageter is ');
    
    const data = await MentorRequest
      .find(qury)
      .sort({ createdAt: sort })
      .skip(limit * (page - 1));
    const total = await MentorRequest.countDocuments(qury);
    return { data, total };
  }
  async getRequstByuserid(userid: string): Promise<Imentorrequst | null> {
    console.log(userid,'user id s');
    
    return await MentorRequest.findOne({ userid: userid });
  }
}
export default new Beamentor();
