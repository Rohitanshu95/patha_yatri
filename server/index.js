import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

// Import route modules linearly from routes folder
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roomRoutes from "./routes/room.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import billRoutes from "./routes/bill.routes.js";
import hotelRoutes from "./routes/hotel.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import reportRoutes from "./routes/report.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import connectDB from "./config/db.js";

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Main API Router Mappings
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/guests", guestRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

server.listen(PORT || 5000, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT || 5000}`,
  );
});

export default app;
