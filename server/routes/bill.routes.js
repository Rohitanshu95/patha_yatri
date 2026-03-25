import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getBill, getInvoicePDF, applyDiscount, generateBill, getAllBills } from "../controllers/bill.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const MANAGER_PLUS = ["manager", "admin"];

router.use(authenticate);

router.get('/', authorize(...RECEPTIONIST_PLUS), getAllBills);
router.post("/generate", authorize(...RECEPTIONIST_PLUS), auditWrite("Bill"), generateBill);
router.get('/booking/:bookingId', authorize(...RECEPTIONIST_PLUS), getBill);
router.get("/:id/invoice", authorize(...RECEPTIONIST_PLUS), getInvoicePDF);
router.patch("/:id/discount", authorize(...RECEPTIONIST_PLUS), auditWrite("Bill"), applyDiscount);

export default router;
