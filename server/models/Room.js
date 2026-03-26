import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    room_number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    room_category: {
      type: String,
      enum: ["standard", "deluxe", "suite"],
      required: true,
    },
    floor: { type: Number },
    availability: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      required: true,
    },
    price: {
      per_night: { type: Number, required: true },
      per_hour: { type: Number },
      tax_percent: { type: Number, required: true },
    },
    amenities: [{ type: String }],
    max_occupants: { type: Number, required: true },
    images: [{ type: String }],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  },
  { timestamps: true },
);

roomSchema.index({ availability: 1 });
roomSchema.index({ room_category: 1 });

export default mongoose.model("Room", roomSchema);
