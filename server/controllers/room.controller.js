import { uploadToCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import Room from "../models/Room.js";

export const createRoom = async (req, res, next) => {
  try {
    const data = req.body;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "rooms");
        imageUrls.push(url);
      }
    }

    const roomData = {
      ...data,
      price: {
        per_night: Number(data.price_per_night),
        per_hour: data.price_per_hour ? Number(data.price_per_hour) : undefined,
        tax_percent: Number(data.tax_percent),
      },
      amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()) : [],
      images: imageUrls,
    };

    const room = new Room(roomData);
    await room.save();

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const listRooms = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      category, 
      status, 
      minPrice, 
      maxPrice 
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { room_number: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // Exact matches
    if (category && category !== "all") query.room_category = category;
    if (status && status !== "all") query.availability = status;

    // Price range
    if (minPrice || maxPrice) {
      query["price.per_night"] = {};
      if (minPrice) query["price.per_night"].$gte = Number(minPrice);
      if (maxPrice) query["price.per_night"].$lte = Number(maxPrice);
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Attach active guest info for occupied rooms
    const populatedRooms = await Promise.all(rooms.map(async (room) => {
      if (room.availability === "occupied") {
        const activeBooking = await mongoose.model('Booking').findOne({
          room_id: room._id,
          status: "checked-in"
        }).populate('guest_id', 'name').lean();

        if (activeBooking && activeBooking.guest_id) {
          return { ...room, currentGuestName: activeBooking.guest_id.name };
        }
      }
      return room;
    }));

    res.json({
      data: populatedRooms,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const data = req.body;
    let imageUrls = data.existing_images ? JSON.parse(data.existing_images) : [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "rooms");
        imageUrls.push(url);
      }
    }

    const updateData = { ...data };
    if (data.price_per_night && data.tax_percent) {
      updateData.price = {
        per_night: Number(data.price_per_night),
        per_hour: data.price_per_hour ? Number(data.price_per_hour) : undefined,
        tax_percent: Number(data.tax_percent),
      };
    }
    if (data.amenities) {
      updateData.amenities = typeof data.amenities === 'string' ? data.amenities.split(',').map(a => a.trim()) : data.amenities;
    }
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const changeRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["available", "occupied", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const room = await Room.findByIdAndUpdate(req.params.id, { availability: status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, occupants } = req.query;
    // Simple availability check based on pure room status for now.
    // Advanced check would query active bookings between dates.
    const query = { availability: "available" };
    if (occupants) query.max_occupants = { $gte: Number(occupants) };
    
    const rooms = await Room.find(query).lean();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};