import { createClient } from "redis";

// Check for environment variables for Redis connection, if not set, fallback to default
const redisHost = process.env.REDIS_HOST || "localhost"; 
const redisPort = Number(process.env.REDIS_PORT) || 6379; 
console.log("redis conecting ", redisHost, redisPort);
const redisUrl = `redis://${redisHost}:${redisPort}`;
console.log(redisUrl,'url ias ');

const redis = createClient({
  url: redisUrl,
})

export default redis;
