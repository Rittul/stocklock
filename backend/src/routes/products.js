const express = require("express");

const prisma = require("../lib/prisma");

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  try {

    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true
          }
        }
      }
    });

    const formattedProducts = products.map((product) => {

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,

        warehouses: product.inventories.map((inventory) => ({
          warehouseId: inventory.warehouse.id,
          warehouseName: inventory.warehouse.name,
          city: inventory.warehouse.city,

          totalStock: inventory.totalStock,

          reservedStock: inventory.reservedStock,

          availableStock:
            inventory.totalStock - inventory.reservedStock
        }))
      };
    });

    res.json(formattedProducts);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = productRouter;