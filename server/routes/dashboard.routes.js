import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getReceptionistDashboard, getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const ADMIN_ONLY = ["admin"];

router.use(authenticate);

// Get receptionist dashboard metrics
router.get("/receptionist", authorize(...RECEPTIONIST_PLUS), getReceptionistDashboard);

// Get admin dashboard metrics
router.get("/admin", authorize(...ADMIN_ONLY), getAdminDashboard);

export default router;
