import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "../models/Room.js";

// Load environment variables
dotenv.config();

// Determine categories and weights (60% standard, 30% deluxe, 10% suite)
const categories = ["standard", "deluxe", "suite"];
const categoryWeights = [0.6, 0.3, 0.1];

const categoryData = {
  standard: {
    // Prices based on typical average Indian budgets for standard rooms
    price: { per_night: 2800, tax_percent: 12 },
    max_occupants: 2,
    amenities: ["Free Wi-Fi", "AC", "TV", "Daily Housekeeping", "Attached Bathroom", "Room Service"],
  },
  deluxe: {
    // Premium amenities with a mid-range price
    price: { per_night: 4800, tax_percent: 12 },
    max_occupants: 3,
    amenities: ["Free Wi-Fi", "AC", "Smart TV", "Mini Fridge", "City View", "Coffee Maker", "Attached Bathroom", "Daily Housekeeping", "24/7 Room Service"],
  },
  suite: {
    // Luxury stay with high-end amenities and above Rs 7500 triggers 18% GST slab
    price: { per_night: 9500, tax_percent: 18 },
    max_occupants: 4,
    amenities: ["Free Wi-Fi", "Central AC", "Smart TV", "Mini Bar", "Premium View", "Living Area", "Bathtub", "Premium Toiletries", "Coffee Maker", "Daily Housekeeping", "24/7 Room Service", "Complimentary Breakfast"],
  }
};

// Function to pick a random room category based on weight
function getRandomCategory() {
  const rand = Math.random();
  let cumulativeValue = 0;
  for (let i = 0; i < categories.length; i++) {
    cumulativeValue += categoryWeights[i];
    if (rand <= cumulativeValue) {
      return categories[i];
    }
  }
  return categories[0];
}

const seedRooms = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    // Fallback to local MongoDB URI if not present in .env
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel_management");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // 2. Clear existing rooms (Optional but recommended for a pure seed script)
    console.log("Clearing existing rooms collection...");
    await Room.deleteMany({});
    console.log("Existing rooms cleared.");

    // 3. Generate rooms
    const roomsToInsert = [];
    // Hotel has ground floor (0) + 6 floors = 7 floors total
    const totalFloors = 7; 
    const roomsPerFloor = 40;

    for (let floor = 0; floor < totalFloors; floor++) {
      for (let roomIdx = 1; roomIdx <= roomsPerFloor; roomIdx++) {
        // Room Number Logic:
        // floor = 2, room = 36 -> 236
        // floor = 5, room = 8 -> 508
        // floor = 0, room = 8 -> 008
        const roomStr = floor === 0 
            ? `0${roomIdx.toString().padStart(2, '0')}` // Ground floor like "008"
            : `${floor}${roomIdx.toString().padStart(2, '0')}`; // Other floors like "508"
            
        const roomName = `Room ${roomStr}`;
        
        const category = getRandomCategory();
        const details = categoryData[category];

        const room = {
          room_number: roomStr,
          name: roomName,
          room_category: category,
          floor: floor,
          availability: "available",
          price: details.price,
          amenities: details.amenities,
          max_occupants: details.max_occupants,
          images: [], // Empty for now as requested
        };

        roomsToInsert.push(room);
      }
    }

    // 4. Batch Insert
    console.log(`Inserting ${roomsToInsert.length} rooms...`);
    await Room.insertMany(roomsToInsert);
    console.log(`✅ Successfully seeded 280 rooms (7 floors * 40 rooms)!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding rooms data:", error);
    process.exit(1);
  }
};

seedRooms();
