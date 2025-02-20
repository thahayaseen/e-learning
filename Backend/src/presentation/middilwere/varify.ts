// import { Request, Response, NextFunction } from "express"
// import { userRepo, userCases } from "../../config/users"
// import { handleError } from "../../utils/handleerror"

//   // async otpverify(req: Request, res: Response, next: NextFunction) {
//   //   try {
//   //     let ids:string
//   //     if(req.body.email){
//   //       const temp=await userRepo.findByEmail(req.body.email)
//   //       if(!temp||!temp._id){
//   //         throw new Error("User not fount")
//   //       }
//   //       ids=temp._id.toString()
//   //     }
//   //     else{
//   //       ids=req.body.userid
//   //     }
//   //     const isValid = await userCases.verifyOtp(req.body.otp,ids);
//   //     if (isValid) {
//   //       req.body = { userid: ids };

//   //       next();
//   //     }
//   //   } catch (error) {
//   //     handleError(res, error, 401);
//   //   }
//   // }
export default class{
  async jwtTockenvarify(){
    
  }
}