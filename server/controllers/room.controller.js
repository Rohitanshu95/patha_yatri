import { uploadToCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

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

    if (req.user && !data.hotel) {
        const currentUser = await User.findById(req.user.id);
        if (currentUser?.hotel) {
            data.hotel = currentUser.hotel;
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
      hotel: data.hotel,
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
    if (req.user) {
        const currentUser = await User.findById(req.user.id);
        if (currentUser?.hotel) {
            query.hotel = currentUser.hotel;
        }
    }

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
    const query = { availability: "available" };
    if (req.user) {
        const currentUser = await User.findById(req.user.id);
        if (currentUser?.hotel) {
            query.hotel = currentUser.hotel;
        }
    }
    if (occupants) query.max_occupants = { $gte: Number(occupants) };
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;

    if (
      checkInDate &&
      checkOutDate &&
      !Number.isNaN(checkInDate.getTime()) &&
      !Number.isNaN(checkOutDate.getTime()) &&
      checkOutDate > checkInDate
    ) {
      const overlappingRoomIds = await Booking.distinct("room_id", {
        status: { $in: ["booked", "checked-in"] },
        $expr: {
          $and: [
            { $lt: ["$check_in_date", checkOutDate] },
            {
              $gt: [
                { $ifNull: ["$check_out_date", "$expected_checkout"] },
                checkInDate,
              ],
            },
          ],
        },
      });

      if (overlappingRoomIds.length > 0) {
        query._id = { $nin: overlappingRoomIds };
      }
    }

    const rooms = await Room.find(query).lean();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};