import RedisOtp from "../../domain/repositories/redisRepo";
import Otp from "../../domain/entities/otp";
import User from "../../domain/entities/UserSchema";
import redis from "../../config/redis";
export default class GenereteOtpuser {
  constructor(private otprepos: RedisOtp) {}
  async exexute(userId: string): Promise<string> {
    const isaldredy = await this.getotp(userId);
    if (isaldredy) {
      return String(isaldredy);
    }
    const otpEntity = new Otp(userId);
    await this.otprepos.storeOtp(userId, otpEntity.getOtp(), 500);
    return String(otpEntity.getOtp());
  }
  async reOtp(Id: string): Promise<string> {
    let otp = await this.otprepos.getotp(Id);
   
    
    
    if (!otp ) {
      
      otp = await this.exexute(Id);
    }
    return otp;
  }
  async getotp(Id: string) {
    return await this.otprepos.getotp(Id);
  }
  async storedata(users: User) {
    return await this.otprepos.saveUser(users);
  }
  async FindData(id: string) {
    return await this.otprepos.getBtId(id);
  }
  async createTockens(userId: string): Promise<string> {
    console.log(userId, "in tokenmaing");

    const data = await this.otprepos.findTockn(userId);
    console.log("data is ", data);
    if (data) {
      return data;
    }
    return this.otprepos.createTocken(userId);
  }
  async Udelete(id: string) {
    await this.otprepos.deleteUser(id);
  }
  async Otpdelete(id: string) {
    await this.otprepos.deleteOtp(id);
  }
}
