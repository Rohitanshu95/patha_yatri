import express from "express";
import { createHotel, deleteHotelById, getAllHotels, getHotelById, updateHotelById } from "../controllers/hotel.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];

router.get("/", authenticate, authorize(...RECEPTIONIST_PLUS), getAllHotels);
router.get("/:id", authenticate, authorize(...RECEPTIONIST_PLUS), getHotelById);

router.post(
	"/",
	authenticate,
	authorize("admin"),
	upload.array("photos", 5),
	auditWrite("Hotel"),
	createHotel
);

router.put(
	"/:id",
	authenticate,
	authorize("admin"),
	upload.array("photos", 5),
	auditWrite("Hotel"),
	updateHotelById
);

router.delete(
	"/:id",
	authenticate,
	authorize("admin"),
	auditWrite("Hotel"),
	deleteHotelById
);


export default router;