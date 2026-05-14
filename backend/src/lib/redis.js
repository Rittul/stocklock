const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  }
};

const needsTls =
  process.env.REDIS_TLS === "true" ||
  (process.env.REDIS_HOST && process.env.REDIS_HOST.includes("upstash.io")) ||
  process.env.NODE_ENV === "production";

if (needsTls) {
  redisConfig.tls = {};
}

const redis = new Redis(redisConfig);

redis.on("connect", () => console.info("Redis: connect"));
redis.on("ready", () => console.info("Redis: ready"));
redis.on("error", (err) => console.error("Redis error:", err));
redis.on("close", () => console.warn("Redis: connection closed"));
redis.on("reconnecting", (delay) => console.info("Redis: reconnecting in", delay));

module.exports = redis;