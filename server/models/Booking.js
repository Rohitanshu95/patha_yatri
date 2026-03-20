import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date },
    expected_checkout: { type: Date, required: true },
    status: {
      type: String,
      enum: ["booked", "checked-in", "checked-out", "cancelled"],
      required: true,
    },
    booking_source: {
      type: String,
      enum: ["walk-in", "online", "OTA", "phone"],
    },
    advance_paid: { type: Number },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    notes: { type: String },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ status: 1 });
bookingSchema.index({ check_in_date: 1 });
bookingSchema.index({ room_id: 1 });
bookingSchema.index({ guest_id: 1 });

export default mongoose.model("Booking", bookingSchema);
