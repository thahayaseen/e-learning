import { createClient } from "redis";

// Check for environment variables for Redis connection, if not set, fallback to default
const redisHost = process.env.REDIS_HOST || "redis://localhost"; // Default to 'localhost' if not set
const redisPort = Number(process.env.REDIS_PORT) || 6379; // Default to 6379 if not set
console.log("redis conecting ", redisHost, redisPort);

const redis = createClient({
  url: redisHost + ":" + redisPort,
});

export default redis;
