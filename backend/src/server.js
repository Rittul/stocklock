const express = require("express");
const app = express();
const cors = require("cors");
require("./workers/worker");

const productRoutes = require("./routes/products");
const warehouseRoutes = require("./routes/warehouse");
const reservationRoutes = require("./routes/reservation");



app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});