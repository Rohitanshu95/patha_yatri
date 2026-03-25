import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { 
  getAllBookings,
  getBookingById,
  updateBooking,
  createBooking, 
  checkIn, 
  checkOut, 
  cancelBooking, 
  addService, 
  removeService 
} from "../controllers/booking.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const MANAGER_PLUS = ["manager", "admin"];

router.use(authenticate);

router.get("/", authorize(...RECEPTIONIST_PLUS), getAllBookings);
router.get("/:id", authorize(...RECEPTIONIST_PLUS), getBookingById);
router.post("/", authorize(...RECEPTIONIST_PLUS), auditWrite("Booking"), createBooking);
router.patch("/:id", authorize(...RECEPTIONIST_PLUS), auditWrite("Booking"), updateBooking);
router.patch("/:id/checkin", authorize(...RECEPTIONIST_PLUS), auditWrite("Booking"), checkIn);
router.patch("/:id/checkout", authorize(...RECEPTIONIST_PLUS), auditWrite("Booking"), checkOut);
router.patch("/:id/cancel", authorize(...MANAGER_PLUS), auditWrite("Booking"), cancelBooking);
router.post("/:id/services", authorize(...RECEPTIONIST_PLUS), auditWrite("Service"), addService);
router.delete("/:id/services/:serviceId", authorize(...RECEPTIONIST_PLUS), auditWrite("Service"), removeService);

export default router;
