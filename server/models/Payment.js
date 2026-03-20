import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "card", "UPI", "online_gateway"],
      required: true,
    },
    amount: { type: Number, required: true },
    transaction_id: { type: String },
    payment_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["success", "failed", "refunded", "pending"],
      required: true,
    },
    refund_amount: { type: Number },
    refund_date: { type: Date },
    collected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true },
);

paymentSchema.index({ bill_id: 1 });
paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ payment_date: 1 });
paymentSchema.index({ transaction_id: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", paymentSchema);
