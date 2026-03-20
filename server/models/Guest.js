import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    documents: {
      id_proof: { type: String, required: true },
      number: { type: String, required: true },
      file_url: { type: String, required: true },
    },
    occupants: {
      total: { type: Number, required: true },
      adults: {
        count: { type: Number, required: true },
        male: { type: Number, required: true },
        female: { type: Number, required: true },
      },
      children: { type: Number, required: true },
    },
    booking_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  },
  { timestamps: true },
);

guestSchema.index({ email: 1 });

export default mongoose.model("Guest", guestSchema);
