import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getReceptionistDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];

router.use(authenticate);

// Get receptionist dashboard metrics
router.get("/receptionist", authorize(...RECEPTIONIST_PLUS), getReceptionistDashboard);

export default router;
