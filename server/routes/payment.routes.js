import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { 
  recordPayment, 
  listPayments,
  refundPayment, 
  createRazorpayOrder, 
  verifyRazorpay 
} from "../controllers/payment.controller.js";
import { auditWrite } from "../middleware/auditLogger.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const MANAGER_PLUS = ["manager", "admin"];

router.use(authenticate);

router.get("/", authorize(...RECEPTIONIST_PLUS), listPayments);
router.post("/record", authorize(...RECEPTIONIST_PLUS), auditWrite("Payment"), recordPayment);
router.post("/:id/refund", authorize(...MANAGER_PLUS), auditWrite("Payment"), refundPayment);

router.post("/online/create-order", authorize(...RECEPTIONIST_PLUS), auditWrite("Payment"), createRazorpayOrder);
router.post("/online/verify", authorize(...RECEPTIONIST_PLUS), auditWrite("Payment"), verifyRazorpay);

export default router;