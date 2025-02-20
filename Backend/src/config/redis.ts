import RedisOtp from "../infrastructure/repositories/otpRedis";
import redis from '../application/useCases/redis'
const redisRepo=new RedisOtp()
export default new redis(redisRepo)