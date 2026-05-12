const express = require("express");

const prisma = require("../lib/prisma");

const warehouseRouter = express.Router();

warehouseRouter.get("/", async (req, res) => {

  try {

    const warehouses = await prisma.warehouse.findMany();

    res.json(warehouses);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = warehouseRouter;