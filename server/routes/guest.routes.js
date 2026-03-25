import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { registerGuest, listGuests, getGuest, updateGuest } from "../controllers/guest.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];

router.use(authenticate, authorize(...RECEPTIONIST_PLUS));

router.post("/", upload.single("id_proof_file"), auditWrite("Guest"), registerGuest);
router.get("/", listGuests);
router.get("/:id", getGuest);
router.put("/:id", upload.single("id_proof_file"), auditWrite("Guest"), updateGuest);

export default router;
