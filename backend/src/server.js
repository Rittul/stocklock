require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "*"
}));

// Load worker (BullMQ)
require("./workers/worker");

const productRoutes = require("./routes/products");
const warehouseRoutes = require("./routes/warehouse");
const reservationRoutes = require("./routes/reservation");

app.use(express.json());

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.status(200).send("Backend working");
});

app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Prevent unhandled errors from crashing the server
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});