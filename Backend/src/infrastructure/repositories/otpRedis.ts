import jwt from "../../config/jwt";
import User from "../../domain/entities/UserSchema";
import RedisOtps from "../../domain/repositories/redisRepo";
import redis from "../redis/configredis";
import { v4 as uuid } from "uuid";

export default class RedisOtp implements RedisOtps {
  async storeOtp(
    userId: string,
    otp: number,
    expirySeconds: number
  ): Promise<void> {
    await redis.setEx(`otp:${userId}`, 600, otp.toString());
  }

  async getotp(userId: string): Promise<string | null> {
    const otp = await redis.get(`otp:${userId}`);
    return otp || null;
  }

  async saveUser(users: User): Promise<{ uid: string; user: User }> {
    const uid = uuid();
    await redis.setEx(`user:${uid}`, 1800, JSON.stringify(users));

    return { uid, user: users };
  }
  async getBtId(uId: string): Promise<User | null> {
    console.log(uId);

    let data = await redis.get(`user:${uId}`);

    if (data) {
      const ans: User = JSON.parse(data);
      console.log(ans);

      return ans;
    }
    return null;
  }
  // ✅ Delete OTP
  async deleteOtp(userId: string): Promise<void> {
    await redis.del(`otp:${userId}`);
  }
  async createTocken(uId: string): Promise<string> {
    const Tocken = await jwt.generateToken({ userid: uId });
    redis.setEx(`Userid:${uId}`, 600, Tocken.accses);
    return Tocken.accses;
  }
  async findTockn(uId: string): Promise<string | null> {
    const data = await redis.get(`Userid:${uId}`);
    if (!data) {
      return null;
    }
    return data;
  }
  async deleteUser(Id: string): Promise<void> {
    await redis.del(`user:${Id}`);
    return;
  }
}
