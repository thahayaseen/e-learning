import { createClient } from "redis";

// Check for environment variables for Redis connection, if not set, fallback to default
const redisHost = process.env.REDIS_HOST || "localhost"; 
const redisPort = Number(process.env.REDIS_PORT) || 6379; 
 
const redisUrl = `redis://${redisHost}:${redisPort}`;
 

const redis = createClient({
  url: redisUrl,
})

export default redis;
