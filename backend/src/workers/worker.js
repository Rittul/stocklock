const { Worker } = require("bullmq");

const redis = require("../lib/redis");

const prisma = require("../lib/prisma");

const worker = new Worker(
  "reservation-expiry",

  async (job) => {

    const { reservationId } = job.data;

    console.log(
      `Processing expiration for reservation ${reservationId}`
    );

    await prisma.$transaction(async (tx) => {

      const reservation =
        await tx.reservation.findUnique({
          where: {
            id: reservationId
          }
        });

      if (!reservation) return;

      if (reservation.status !== "pending") return;

      // release stock
      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId
        },

        data: {
          reservedStock: {
            decrement: reservation.quantity
          }
        }
      });

      // mark released
      await tx.reservation.update({
        where: {
          id: reservation.id
        },

        data: {
          status: "released"
        }
      });

      console.log(
        `Reservation ${reservation.id} expired`
      );
    });
  },

  {
    connection: redis
  }
);

module.exports = worker;