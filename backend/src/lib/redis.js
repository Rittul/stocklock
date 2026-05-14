const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

if (process.env.NODE_ENV === "production") {
  redisConfig.tls = {};
}

module.exports = redis;