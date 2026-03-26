import Hotel from "../models/Hotels.model.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// ─── GET ALL HOTELS ───────────────────────────────────────────────────────────
// GET /hotels
// Returns paginated hotels. Supports optional ?location and ?amenities filters.
export const getAllHotels = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      amenities,
    } = req.query;

    const filter = {};

    if (location) {
      filter["location.address"] = { $regex: location, $options: "i" };
    }

    if (amenities) {
      const amenityList = amenities.split(",").map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate("manager", "name email")
        .populate("receptionists", "name email")
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Hotel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE HOTEL ─────────────────────────────────────────────────────────────
// POST /hotels
// Only admins or managers should hit this route (enforce via auth middleware).
export const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      manager,
      website,
    } = req.body;

    let locationData = req.body.location;
    let proximityData = req.body.proximity;
    let amenitiesData = req.body.amenities;
    let phoneData = req.body.phone;
    let receptionistsData = req.body.receptionists;

    if (typeof locationData === "string") {
      try { locationData = JSON.parse(locationData); } catch (e) { locationData = {}; }
    }
    if (typeof proximityData === "string") {
      try { proximityData = JSON.parse(proximityData); } catch (e) { proximityData = {}; }
    }
    if (typeof amenitiesData === "string") {
      try { amenitiesData = JSON.parse(amenitiesData); } catch (e) { amenitiesData = []; }
    }
    if (typeof phoneData === "string") {
      try { phoneData = JSON.parse(phoneData); } catch (e) { phoneData = []; }
    }
    if (typeof receptionistsData === "string") {
      try { receptionistsData = JSON.parse(receptionistsData); } catch (e) { receptionistsData = []; }
    }

    if (!name || !locationData?.address || !manager) {
      return res.status(400).json({
        success: false,
        message: "name, location.address, and manager are required.",
      });
    }

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "hotels");
        photoUrls.push(url);
      }
    }
    let existingPhotos = req.body.photos || [];
    if (typeof existingPhotos === "string") existingPhotos = [existingPhotos];
    const allPhotos = [...existingPhotos, ...photoUrls];

    const hotel = await Hotel.create({
      name,
      location: locationData,
      manager,
      receptionists: receptionistsData ?? [],
      proximity: proximityData,
      phone: phoneData ?? [],
      website,
      amenities: amenitiesData ?? [],
      photos: allPhotos,
    });

    const roomsAvailable = parseInt(req.body.roomsAvailable) || 0;
    if (roomsAvailable > 0) {
      const roomDocs = [];
      for (let i = 1; i <= roomsAvailable; i++) {
        roomDocs.push({
          room_number: `${hotel.name.slice(0,3).toUpperCase().replace(/[^A-Z]/g, 'H')}-${hotel._id.toString().slice(-4)}-${100 + i}`,
          name: `Room ${100 + i}`,
          room_category: "standard",
          availability: "available",
          price: {
            per_night: 0,
            tax_percent: 0,
          },
          max_occupants: 2,
          hotel: hotel._id,
        });
      }
      try {
        const createdRooms = await Room.insertMany(roomDocs);
        hotel.rooms = createdRooms.map(r => r._id);
        await hotel.save();
      } catch (err) {
        console.error("Failed to insert dummy rooms:", err);
      }
    }

    return res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ─── GET HOTEL BY ID ──────────────────────────────────────────────────────────
// GET /hotels/:id
// Populates rooms and the 20 most recent bookings for dashboard use.
export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid hotel ID." });
    }

    const hotel = await Hotel.findById(id)
      .populate("manager", "name email role")
      .populate("receptionists", "name email role")
      .populate({
        path: "rooms",
        select: "room_number name room_category floor availability price amenities max_occupants images",
      })
      .populate({
        path: "booking",
        select: "room_id guest_id check_in_date expected_checkout status booking_source advance_paid",
        populate: { path: "room_id", select: "room_number name" },
        options: { sort: { createdAt: -1 }, limit: 20 },
      })
      .lean();

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found." });
    }

    return res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE HOTEL BY ID ───────────────────────────────────────────────────────
// PUT /hotels/:id
// Partial updates only — fields absent from req.body are left unchanged.
// rooms and booking arrays are excluded; manage them via their own routes.
export const updateHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid hotel ID." });
    }

    // Strip immutable / relationship fields that must not be changed here
    const { rooms, booking, _id, __v, ...updateData } = req.body;

    ["location", "proximity", "amenities", "phone", "receptionists"].forEach((key) => {
      if (typeof updateData[key] === "string") {
        try { updateData[key] = JSON.parse(updateData[key]); } catch (e) {}
      }
    });

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "hotels");
        photoUrls.push(url);
      }
    }
    if (photoUrls.length > 0 || updateData.photos) {
      let existingPhotos = updateData.photos || [];
      if (typeof existingPhotos === "string") existingPhotos = [existingPhotos];
      updateData.photos = [...existingPhotos, ...photoUrls];
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No update fields provided." });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("manager", "name email")
      .populate("receptionists", "name email")
      .lean();

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "Hotel not found." });
    }

    return res.status(200).json({ success: true, data: updatedHotel });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ─── DELETE HOTEL BY ID ───────────────────────────────────────────────────────
// DELETE /hotels/:id
// Cascade-deletes all Rooms and Bookings that belong to this hotel.
// Blocks deletion if any booking is still active (booked | checked-in).
export const deleteHotelById = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Invalid hotel ID." });
    }

    const hotel = await Hotel.findById(id).session(session);
    if (!hotel) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Hotel not found." });
    }

    // Guard: refuse deletion if any booking is still live
    const activeBookings = await Booking.countDocuments({
      _id: { $in: hotel.booking },
      status: { $in: ["booked", "checked-in"] },
    }).session(session);

    if (activeBookings > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: `Cannot delete hotel — ${activeBookings} active booking(s) still exist.`,
      });
    }

    // Cascade: bookings → rooms → hotel
    await Booking.deleteMany({ _id: { $in: hotel.booking } }).session(session);
    await Room.deleteMany({ _id: { $in: hotel.rooms } }).session(session);
    await hotel.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Hotel and all associated rooms and bookings deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};