const express = require("express");
const app = express();
const cors = require("cors");

// const productRoutes = require("./routes/product.routes");
// const warehouseRoutes = require("./routes/warehouse.routes");
// const reservationRoutes = require("./routes/reservation.routes");



app.use(cors());
app.use(express.json());

// app.use("/api/products", productRoutes);
// app.use("/api/warehouses", warehouseRoutes);
// app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});