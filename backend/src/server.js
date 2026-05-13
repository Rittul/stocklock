const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");

app.use(cors({
  origin: "*"
}));
// require("./workers/worker");

const productRoutes = require("./routes/products");
const warehouseRoutes = require("./routes/warehouse");
const reservationRoutes = require("./routes/reservation");



app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend working");
});
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});