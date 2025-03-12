import { UserDTO } from "../../app/dtos/Duser";
import User from "../../domain/entities/UserSchema"

export  interface IRedis{
    storeOtp(userId:string,otp:number,exporeySecond:number):Promise<void>
    getotp(userId:string):Promise<string|null>
    saveUser(userid:string,users:string,expirySeconds:number):Promise<{ userid: string; users: string }>
    deleteOtp(userId:string):Promise<void>
    getBtId(uId:string):Promise<UserDTO|null>
    setToken(uId:string,token:string):Promise<string>
    findTockn(uId:string):Promise<string|null>
    deleteUser(Id:string):Promise<void>

}