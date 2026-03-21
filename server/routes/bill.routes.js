import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getBill, getInvoicePDF, applyDiscount, generateBill, getAllBills } from "../controllers/bill.controller.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const MANAGER_PLUS = ["manager", "admin"];

router.use(authenticate);

router.post("/generate", authorize(...RECEPTIONIST_PLUS), generateBill);
router.get('/', authorize(...RECEPTIONIST_PLUS), getAllBills);
router.get('/booking/:bookingId', authorize(...RECEPTIONIST_PLUS), getBill);
router.get("/:id/invoice", authorize(...RECEPTIONIST_PLUS), getInvoicePDF);
router.patch("/:id/discount", authorize(...MANAGER_PLUS), applyDiscount);

export default router;
