const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

  // USERS
  await prisma.user.createMany({
    data: [
      {
        name: "Alice",
        email: "alice@test.com"
      },
      {
        name: "Bob",
        email: "bob@test.com"
      },
      {
        name: "Charlie",
        email: "charlie@test.com"
      }
    ]
  });

  // PRODUCTS
  await prisma.product.createMany({
    data: [
      {
        name: "iPhone 16",
        description: "Apple smartphone",
        price: 99999
      },
      {
        name: "PlayStation 5",
        description: "Sony gaming console",
        price: 54999
      }
    ]
  });

  // WAREHOUSES
  await prisma.warehouse.createMany({
    data: [
      {
        name: "Delhi Warehouse",
        city: "Delhi"
      },
      {
        name: "Mumbai Warehouse",
        city: "Mumbai"
      },
      {
        name: "Gujrat Warehouse",
        city: "Gujrat"
      }
    ]
  });

  // INVENTORY
  await prisma.inventory.createMany({
    data: [
      {
        productId: 1,
        warehouseId: 1,
        totalStock: 10
      },
      {
        productId: 1,
        warehouseId: 2,
        totalStock: 5
      },
      {
        productId: 2,
        warehouseId: 1,
        totalStock: 7
      }
    ]
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });