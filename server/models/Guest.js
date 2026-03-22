import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    documents: {
      id_proof: { type: String },
      number: { type: String },
      file_url: { type: String },
    },
    occupants: {
      total: { type: Number, default: 1 },
      adults: {
        count: { type: Number, default: 1 },
        male: { type: Number, default: 1 },
        female: { type: Number, default: 0 },
      },
      children: { type: Number, default: 0 },
    },
    verification_status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    booking_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  },
  { timestamps: true },
);

guestSchema.index({ email: 1 });

export default mongoose.model("Guest", guestSchema);
