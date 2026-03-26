import Payment from "../models/Payment.js";
import Bill from "../models/Bill.js";
import crypto from "crypto";
import Razorpay from "razorpay";

const getRazorpayInstance = () => {
  const hasCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  if (!hasCredentials) return null;

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const recordPayment = async (req, res, next) => {
  try {
    const { bill_id, amount, payment_method, transaction_id } = req.body;
    
    const bill = await Bill.findById(bill_id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero" });
    }

    const payableAmount = Number(bill.payable_amount) || Number(bill.total_amount) || 0;
    if (payableAmount <= 0) {
      return res.status(400).json({ message: "Bill total is not finalized" });
    }

    const amountPaid = Number(bill.amount_paid) || 0;
    const remainingAmount = Math.max(0, payableAmount - amountPaid);
    if (remainingAmount <= 0) {
      return res.status(400).json({ message: "Bill is already settled" });
    }
    if (numericAmount > remainingAmount) {
      return res.status(400).json({ message: "Payment exceeds remaining balance" });
    }

    // Ensure payment method matches enum: ["cash", "card", "UPI", "online_gateway"]
    let method = "cash";
    const passedMethod = payment_method?.toLowerCase() || '';
    if (passedMethod.includes('upi')) method = "UPI";
    else if (passedMethod.includes('card')) method = "card";
    else if (passedMethod.includes('online')) method = "online_gateway";
    
    const payment = new Payment({
      bill_id,
      booking_id: bill.booking_id,
      amount: numericAmount,
      method,
      transaction_id,
      payment_date: new Date(),
      status: "success",
      collected_by: req.user.id
    });

    await payment.save();

    bill.amount_paid = amountPaid + numericAmount;
    bill.remaining_amount = Math.max(0, payableAmount - bill.amount_paid);
    if (bill.amount_paid >= payableAmount && payableAmount > 0) {
      bill.status = "paid";
    } else if (bill.amount_paid > 0) {
      bill.status = "partial";
    } else {
      bill.status = "unpaid";
    }

    await bill.save();
    res.status(201).json({ payment, bill });
  } catch (error) {
    next(error);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const { billId, bookingId } = req.query;
    const filter = {};
    if (billId) filter.bill_id = billId;
    if (bookingId) filter.booking_id = bookingId;

    const payments = await Payment.find(filter)
      .populate("collected_by", "name role")
      .sort({ payment_date: -1, createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.status !== "success") {
      return res.status(400).json({ message: "Invalid payment to refund" });
    }

    payment.status = "refunded";
    payment.refund_amount = payment.amount;
    payment.refund_date = new Date();
    await payment.save();

    const bill = await Bill.findById(payment.bill_id);
    if (bill) {
      bill.amount_paid -= payment.amount;
      if (bill.amount_paid <= 0) {
        bill.status = "unpaid";
        bill.amount_paid = 0;
      } else {
        bill.status = "partial";
      }
      const payableAmount = Number(bill.payable_amount) || Number(bill.total_amount) || 0;
      bill.remaining_amount = Math.max(0, payableAmount - bill.amount_paid);
      await bill.save();
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { bill_id, amount } = req.body;

    const bill = await Bill.findById(bill_id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero" });
    }

    const payableAmount = Number(bill.payable_amount) || Number(bill.total_amount) || 0;
    if (payableAmount <= 0) {
      return res.status(400).json({ message: "Bill total is not finalized" });
    }

    const amountPaid = Number(bill.amount_paid) || 0;
    const remainingAmount = Math.max(0, payableAmount - amountPaid);
    if (remainingAmount <= 0) {
      return res.status(400).json({ message: "Bill is already settled" });
    }
    if (numericAmount > remainingAmount) {
      return res.status(400).json({ message: "Payment exceeds remaining balance" });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ message: "Online payment gateway is not configured" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: String(bill_id),
    });

    res.status(201).json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpay = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bill_id,
    } = req.body;

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ message: "Online payment gateway is not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const bill = await Bill.findById(bill_id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const numericAmount = Number(order?.amount || 0) / 100;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount received" });
    }

    const payableAmount = Number(bill.payable_amount) || Number(bill.total_amount) || 0;
    if (payableAmount <= 0) {
      return res.status(400).json({ message: "Bill total is not finalized" });
    }

    const amountPaid = Number(bill.amount_paid) || 0;
    const remainingAmount = Math.max(0, payableAmount - amountPaid);
    if (remainingAmount <= 0) {
      return res.status(400).json({ message: "Bill is already settled" });
    }
    if (numericAmount > remainingAmount) {
      return res.status(400).json({ message: "Payment exceeds remaining balance" });
    }

    const payment = new Payment({
      bill_id,
      booking_id: bill.booking_id,
      amount: numericAmount,
      method: "online_gateway",
      transaction_id: razorpay_payment_id,
      payment_date: new Date(),
      status: "success",
      collected_by: req.user.id,
    });

    await payment.save();

    bill.amount_paid = amountPaid + numericAmount;
    bill.remaining_amount = Math.max(0, payableAmount - bill.amount_paid);
    if (bill.amount_paid >= payableAmount && payableAmount > 0) {
      bill.status = "paid";
    } else if (bill.amount_paid > 0) {
      bill.status = "partial";
    } else {
      bill.status = "unpaid";
    }

    bill.payments = [...(bill.payments || []), payment._id];

    await bill.save();

    res.status(201).json({ payment, bill });
  } catch (error) {
    next(error);
  }
};