const { Queue } = require("bullmq");

const redis = require("../lib/redis");

const reservationExpiryQueue = new Queue(
  "reservation-expiry",
  {
    connection: redis
  }
);

module.exports = reservationExpiryQueue;