import User from "../entities/UserSchema"

export default interface RedisOtp{
    storeOtp(userId:string,otp:number,exporeySecond:number):Promise<void>
    getotp(userId:string):Promise<string|null>
    saveUser(users:User):Promise<{ uid: string; user: User }>
    deleteOtp(userId:string):Promise<void>
    getBtId(uId:string):Promise<User|null>
    createTocken(uId:string):Promise<string>
    findTockn(uId:string):Promise<string|null>
    deleteUser(Id:string):Promise<void>

}