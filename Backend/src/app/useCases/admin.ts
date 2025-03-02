

import IUserReposetory from "../repository/IUser";
import { IAdmin } from "./interface/Iadmin";
class AppError extends Error {
  constructor(message: string, private statuscode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export default class Admin implements IAdmin{
  constructor(private UserRepository:IUserReposetory){}
  async getuserAdata({page,limit}:{page?:string,limit?:string}) {
    try {
     const skip=(Number(page)-1)*Number(limit)
    const data = await this.UserRepository.findAlluser(Number(limit),Number(skip))
    if(!data){
        throw('not fount')
    }
    return data;
   } catch (error:any) {
    new AppError(error.message,404)
   }
  }
  async Blockuser(id:string,type:boolean){
      try {
        console.log(id);
        
        await this.UserRepository.Blockuser(id,type)
        return
      return
      } catch (error:any) {
        new AppError(error.message,404)
      }
  }
}
export type IAdminUsecase = InstanceType<typeof Admin>;
