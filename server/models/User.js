import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "receptionist", "manager"],
      required: true,
    },
    isActive: { type: Boolean, required: true, default: true },
    lastLogin: { type: Date },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
