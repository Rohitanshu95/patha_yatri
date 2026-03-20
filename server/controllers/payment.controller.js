import Payment from "../models/Payment.js";
import Bill from "../models/Bill.js";

export const recordPayment = async (req, res, next) => {
  try {
    const { bill_id, amount, payment_method, transaction_id } = req.body;
    
    const bill = await Bill.findById(bill_id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const payment = new Payment({
      bill_id,
      amount: Number(amount),
      payment_method,
      transaction_id,
      status: "completed",
    });

    await payment.save();

    bill.amount_paid += Number(amount);
    if (bill.amount_paid >= bill.total_amount) {
      bill.status = "paid";
    } else {
      bill.status = "partial";
    }

    await bill.save();
    res.status(201).json({ payment, bill });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.status !== "completed") {
      return res.status(400).json({ message: "Invalid payment to refund" });
    }

    payment.status = "refunded";
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
      await bill.save();
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// Razorpay placeholders
export const createRazorpayOrder = (req, res) => res.status(501).json({ msg: "Not Implemented" });
export const verifyRazorpay = (req, res) => res.status(501).json({ msg: "Not Implemented" });