import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { 
  recordPayment, 
  refundPayment, 
  createRazorpayOrder, 
  verifyRazorpay 
} from "../controllers/payment.controller.js";

const router = express.Router();

const RECEPTIONIST_PLUS = ["receptionist", "manager", "admin"];
const MANAGER_PLUS = ["manager", "admin"];

router.use(authenticate);

router.post("/record", authorize(...RECEPTIONIST_PLUS), recordPayment);
router.post("/:id/refund", authorize(...MANAGER_PLUS), refundPayment);

router.post("/online/create-order", authorize(...RECEPTIONIST_PLUS), createRazorpayOrder);
router.post("/online/verify", authorize(...RECEPTIONIST_PLUS), verifyRazorpay);

export default router;