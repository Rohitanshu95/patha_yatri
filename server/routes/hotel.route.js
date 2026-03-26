import express from "express";
import { createHotel, deleteHotelById, getAllHotels, getHotelById, updateHotelById } from "../controllers/hotel.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllHotels);  // Get all hotels
router.post("/", upload.array("photos", 5), createHotel);  // Create a new hotel
router.get("/:id", getHotelById);  // Get hotel by ID
router.put("/:id", upload.array("photos", 5), updateHotelById);  // Update hotel by ID
router.delete("/:id", deleteHotelById);  // Delete hotel by ID

export default router;