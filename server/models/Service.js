import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    type: {
      type: String,
      enum: ["fooding", "laundry", "spa", "other"],
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total_price: { type: Number, required: true },
    description: { type: String },
    served_at: { type: Date, required: true },
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

serviceSchema.index({ booking_id: 1 });
serviceSchema.index({ type: 1 });
serviceSchema.index({ served_at: 1 });

export default mongoose.model("Service", serviceSchema);
