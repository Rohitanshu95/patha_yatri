import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { 
  getRevenueReport, 
  getOccupancyReport, 
  getGSTReport, 
  getAuditLog 
} from "../controllers/report.controller.js";

const router = express.Router();

const MANAGER_PLUS = ["manager", "admin"];
const ADMIN_ONLY = ["admin"];

router.use(authenticate);

router.get("/revenue", authorize(...MANAGER_PLUS), getRevenueReport);
router.get("/occupancy", authorize(...MANAGER_PLUS), getOccupancyReport);
router.get("/gst", authorize(...MANAGER_PLUS), getGSTReport);
router.get("/audit-logs", authorize(...ADMIN_ONLY), getAuditLog);

export default router;