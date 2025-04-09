import { IRedis } from "../../domain/Provider/IRedis";
import credis from "../config/Redis";
import User from "../../domain/entities/UserSchema";
import { UserDTO } from "../../app/dtos/Duser";

export default class PrRedis implements IRedis {
  private redis;
  constructor() {
    this.redis = credis;

    this.redis.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    this.redis.connect().then(()=>{
      console.log('connected success');
      
    }).catch((err)=>{
      console.log('error when connect redis',err);
      
    })
  }
  async storeOtp(
    userId: string,
    otp: number,
    expirySeconds: number
  ): Promise<void> {
    await this.redis.setEx(`otp:${userId}`, expirySeconds, otp.toString());
  }

  async getotp(userId: string): Promise<string | null> {
    const otp = await this.redis.get(`otp:${userId}`);
    return otp || null;
  }

  async saveUser(userid:string ,users: string,expirySeconds:number): Promise<{ userid: string; users: string }> {

    await this.redis.setEx(`user:${userid}`, expirySeconds, users);

    return { userid, users };
  }
  async getBtId(uId: string): Promise<UserDTO | null> {
    console.log(uId, "from resend");

    let data = await this.redis.get(`user:${uId}`);

    if (data) {
      const ans: User = JSON.parse(data);
      console.log(ans);

      return ans as UserDTO
    }
    return null;
  }
  // ✅ Delete OTP
  async deleteOtp(userId: string): Promise<void> {
    await this.redis.del(`otp:${userId}`);
  }
  async setToken(uId: string,token:string): Promise<string> {
    // const Tocken = await jwt.accsessToken({ userid: uId });
    this.redis.setEx(`Userid:${uId}`, 600, token);
    return token;
  }
  async findTockn(uId: string): Promise<string | null> {
    const data = await this.redis.get(`Userid:${uId}`);
    if (!data) {
      return null;
    }
    return data;
  }
  async deleteUser(Id: string): Promise<void> {
    await this.redis.del(`user:${Id}`);
    return;
  }
}
