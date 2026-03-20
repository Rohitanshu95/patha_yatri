import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@hotel.com",
    password: "Password123",
    role: "admin",
  },
  {
    name: "Manager User",
    email: "manager@hotel.com",
    password: "Password123",
    role: "manager",
  },
  {
    name: "Receptionist User",
    email: "receptionist@hotel.com",
    password: "Password123",
    role: "receptionist",
  },
];

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany();

    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    await User.insertMany(hashedUsers);
    console.log("✅ Users Seeded Successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedUsers();