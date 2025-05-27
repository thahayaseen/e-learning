import { alldata, Imentorrequst } from "../../infra/repositories/beaMentor.repositroy";

export interface ImentorRequestRepo {
  addrequest(userid: string, data: Omit<Imentorrequst, "userid">): Promise<void>;
  acction(dataid: string, action: string): Promise<Imentorrequst | null>;
  getallReqeust(page: number, filter: any): Promise<alldata>;
  getRequstByuserid(userid: string): Promise<Imentorrequst | null> ;
}
