const express = require("express");

const reservationRouter = express.Router();
const prisma = require("../lib/prisma");
const reservationExpiryQueue =require("../queues/reservationexpiory");

reservationRouter.post("/", async (req, res) => {

  const {
    userId,
    productId,
    warehouseId,
    quantity
  } = req.body;

  try {

    const user = await prisma.user.findUnique({
  where: {
    id: userId
  }
});

if (!user) {
  return res.status(404).json({
    message: "User not found"
  });
}

    const result = await prisma.$transaction(async (tx) => {

      // LOCK INVENTORY ROW
      const inventoryRows = await tx.$queryRaw`
        SELECT *
        FROM "Inventory"
        WHERE "productId" = ${productId}
        AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      `;

      const inventory = inventoryRows[0];

      // inventory not found
      if (!inventory) {

        throw new Error("INVENTORY_NOT_FOUND");
      }

      // calculate available stock
      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // not enough stock
      if (availableStock < quantity) {

        throw new Error("INSUFFICIENT_STOCK");
      }

      // increase reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id
        },
        data: {
          reservedStock: {
            increment: quantity
          }
        }
      });

      // reservation expiry (10 mins)
      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      // create reservation
      const reservation = await tx.reservation.create({
        data: {
          userId,
          productId,
          warehouseId,
          quantity,

          expiresAt,

          status: "pending"
        }
      });
      await reservationExpiryQueue.add(
        "expire-reservation",

        {
          reservationId: reservation.id
        },

        {
          delay: 10 * 60 * 1000
        }
      );

      return reservation;
    });

    res.status(201).json({
      message: "Reservation created",
      reservation: result
    });

  } catch (error) {

    console.log(error);

    if (error.message === "INSUFFICIENT_STOCK") {

      return res.status(409).json({
        message: "Not enough stock available"
      });
    }

    if (error.message === "INVENTORY_NOT_FOUND") {

      return res.status(404).json({
        message: "Inventory not found"
      });
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

reservationRouter.get("/:id", async (req, res) => {

  const reservationId = Number(req.params.id);

  try {

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId
      },

      include: {
        product: true,
        warehouse: true,
        user: true
      }
    });

    if (!reservation) {

      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    res.json(reservation);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

reservationRouter.post("/:id/confirm", async (req, res) => {

  const reservationId = Number(req.params.id);

  try {

    const result = await prisma.$transaction(async (tx) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId
        }
      });

      if (!reservation) {

        throw new Error("RESERVATION_NOT_FOUND");
      }

      // already released
      if (reservation.status === "released") {

        throw new Error("RESERVATION_RELEASED");
      }

      // expired
      if (
        reservation.status === "pending" &&
        new Date() > reservation.expiresAt
      ) {

        // release reserved stock
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

        throw new Error("RESERVATION_EXPIRED");
      }

      // confirm reservation
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id
          },

          data: {
            status: "confirmed",
            confirmedAt: new Date()
          }
        });

      return updatedReservation;
    });

    res.json({
      message: "Reservation confirmed",
      reservation: result
    });

  } catch (error) {

    console.log(error);

    if (error.message === "RESERVATION_NOT_FOUND") {

      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (error.message === "RESERVATION_EXPIRED") {

      return res.status(410).json({
        message: "Reservation expired"
      });
    }

    if (error.message === "RESERVATION_RELEASED") {

      return res.status(400).json({
        message: "Reservation already released"
      });
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

reservationRouter.post("/:id/release", async (req, res) => {

  const reservationId = Number(req.params.id);

  try {

    const result = await prisma.$transaction(async (tx) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId
        }
      });

      if (!reservation) {

        throw new Error("RESERVATION_NOT_FOUND");
      }

      if (reservation.status !== "pending") {

        throw new Error("INVALID_RESERVATION_STATE");
      }

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

      // update reservation
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id
          },

          data: {
            status: "released"
          }
        });

      return updatedReservation;
    });

    res.json({
      message: "Reservation released",
      reservation: result
    });

  } catch (error) {

    console.log(error);

    if (error.message === "RESERVATION_NOT_FOUND") {

      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (error.message === "INVALID_RESERVATION_STATE") {

      return res.status(400).json({
        message: "Reservation cannot be released"
      });
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = reservationRouter;