import { uploadToCloudinary } from "../utils/cloudinary.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Hotel from "../models/Hotels.model.js";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const getActorContext = async (req) => {
  if (!req.user?.id) return null;
  return User.findById(req.user.id).select("role hotel").lean();
};

const normalizeHotelId = (value) => {
  if (value === undefined || value === null) return null;

  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "all") return null;

  if (!objectIdRegex.test(trimmed)) return "__invalid__";
  return trimmed;
};

const parseStringArray = (value) => {
  if (value === undefined || value === null || value === "") return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  const raw = String(value).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // fall through to CSV parsing
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const canAccessRoom = (role, actorHotelId, roomHotelId) => {
  if (role === "admin") return true;
  if (!actorHotelId || !roomHotelId) return false;
  return String(actorHotelId) === String(roomHotelId);
};

const buildPagination = (total, pageNumber, limitNumber) => ({
  total,
  page: pageNumber,
  pages: Math.max(1, Math.ceil(total / limitNumber)),
});

export const createRoom = async (req, res, next) => {
  try {
    const data = req.body;
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const actorRole = actor.role;
    const actorHotelId = actor.hotel ? String(actor.hotel) : "";

    const requestedHotel = normalizeHotelId(data.hotel);
    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    let assignedHotelId = "";
    if (actorRole === "admin") {
      if (!requestedHotel) {
        return res.status(400).json({ message: "Hotel is required for room creation" });
      }
      assignedHotelId = requestedHotel;
    } else {
      if (!actorHotelId) {
        return res.status(403).json({ message: "Your account is not assigned to a hotel" });
      }
      assignedHotelId = actorHotelId;
    }

    const hotelExists = await Hotel.exists({ _id: assignedHotelId });
    if (!hotelExists) {
      return res.status(400).json({ message: "Selected hotel does not exist" });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "rooms");
        imageUrls.push(url);
      }
    }

    const perNight = Number(data.price_per_night);
    const taxPercent = Number(data.tax_percent);
    const maxOccupants = Number(data.max_occupants);

    if (!Number.isFinite(perNight) || !Number.isFinite(taxPercent) || !Number.isFinite(maxOccupants)) {
      return res.status(400).json({ message: "Invalid numeric fields for room pricing or occupants" });
    }

    const roomData = {
      room_number: String(data.room_number || "").trim(),
      name: String(data.name || "").trim(),
      room_category: data.room_category,
      availability: data.availability,
      max_occupants: maxOccupants,
      hotel: assignedHotelId,
      price: {
        per_night: perNight,
        per_hour: data.price_per_hour ? Number(data.price_per_hour) : undefined,
        tax_percent: taxPercent,
      },
      amenities: parseStringArray(data.amenities),
      images: imageUrls,
    };

    if (data.floor !== undefined && data.floor !== "") {
      const floor = Number(data.floor);
      if (!Number.isFinite(floor)) {
        return res.status(400).json({ message: "Invalid floor value" });
      }
      roomData.floor = floor;
    }

    const room = new Room(roomData);
    await room.save();

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const listRooms = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      category, 
      status, 
      minPrice,
      maxPrice,
      hotel,
    } = req.query;

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Number.parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    const requestedHotel = normalizeHotelId(hotel);
    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    if (actor.role === "admin") {
      if (requestedHotel) {
        query.hotel = requestedHotel;
      }
    } else {
      const actorHotelId = actor.hotel ? String(actor.hotel) : "";
      if (!actorHotelId) {
        return res.json({
          data: [],
          pagination: buildPagination(0, pageNumber, limitNumber),
        });
      }
      query.hotel = actorHotelId;
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

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Attach active guest info for occupied rooms
    const populatedRooms = await Promise.all(rooms.map(async (room) => {
      if (room.availability === "occupied") {
        const activeBooking = await Booking.findOne({
          room_id: room._id,
          status: "checked-in"
        }).populate("guest_id", "name").lean();

        if (activeBooking && activeBooking.guest_id) {
          return { ...room, currentGuestName: activeBooking.guest_id.name };
        }
      }
      return room;
    }));

    res.json({
      data: populatedRooms,
      pagination: buildPagination(total, pageNumber, limitNumber),
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const actorHotelId = actor.hotel ? String(actor.hotel) : "";
    if (!canAccessRoom(actor.role, actorHotelId, room.hotel)) {
      return res.status(403).json({ message: "Forbidden. You cannot access this room." });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const actorHotelId = actor.hotel ? String(actor.hotel) : "";
    if (!canAccessRoom(actor.role, actorHotelId, room.hotel)) {
      return res.status(403).json({ message: "Forbidden. You cannot update this room." });
    }

    const data = req.body;
    if (data.hotel !== undefined && String(data.hotel).trim() !== String(room.hotel)) {
      return res.status(400).json({ message: "Room hotel cannot be changed from this endpoint" });
    }

    let imageUrls = parseStringArray(data.existing_images);

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "rooms");
        imageUrls.push(url);
      }
    }

    const updateData = {};

    if (data.room_number !== undefined) {
      updateData.room_number = String(data.room_number).trim();
    }
    if (data.name !== undefined) {
      updateData.name = String(data.name).trim();
    }
    if (data.room_category !== undefined) {
      updateData.room_category = data.room_category;
    }
    if (data.availability !== undefined) {
      updateData.availability = data.availability;
    }
    if (data.max_occupants !== undefined && data.max_occupants !== "") {
      const maxOccupants = Number(data.max_occupants);
      if (!Number.isFinite(maxOccupants)) {
        return res.status(400).json({ message: "Invalid max occupants value" });
      }
      updateData.max_occupants = maxOccupants;
    }
    if (data.floor !== undefined && data.floor !== "") {
      const floor = Number(data.floor);
      if (!Number.isFinite(floor)) {
        return res.status(400).json({ message: "Invalid floor value" });
      }
      updateData.floor = floor;
    }

    if (
      data.price_per_night !== undefined ||
      data.price_per_hour !== undefined ||
      data.tax_percent !== undefined
    ) {
      const perNight =
        data.price_per_night !== undefined && data.price_per_night !== ""
          ? Number(data.price_per_night)
          : Number(room.price?.per_night);
      const taxPercent =
        data.tax_percent !== undefined && data.tax_percent !== ""
          ? Number(data.tax_percent)
          : Number(room.price?.tax_percent);

      if (!Number.isFinite(perNight) || !Number.isFinite(taxPercent)) {
        return res.status(400).json({ message: "Invalid pricing fields" });
      }

      updateData.price = {
        per_night: perNight,
        tax_percent: taxPercent,
      };

      if (data.price_per_hour !== undefined && data.price_per_hour !== "") {
        const perHour = Number(data.price_per_hour);
        if (!Number.isFinite(perHour)) {
          return res.status(400).json({ message: "Invalid hourly price value" });
        }
        updateData.price.per_hour = perHour;
      } else if (room.price?.per_hour !== undefined) {
        updateData.price.per_hour = room.price.per_hour;
      }
    }

    if (data.amenities !== undefined) {
      updateData.amenities = parseStringArray(data.amenities);
    }
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
    
    res.json(updatedRoom);
  } catch (error) {
    next(error);
  }
};

export const changeRoomStatus = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const { status } = req.body;
    if (!["available", "occupied", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const actorHotelId = actor.hotel ? String(actor.hotel) : "";
    if (!canAccessRoom(actor.role, actorHotelId, room.hotel)) {
      return res.status(403).json({ message: "Forbidden. You cannot update this room." });
    }
    
    room.availability = status;
    await room.save();

    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const getAvailableRooms = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const { checkIn, checkOut, occupants, hotel } = req.query;
    const query = { availability: "available" };

    const requestedHotel = normalizeHotelId(hotel);
    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    if (actor.role === "admin") {
      if (requestedHotel) {
        query.hotel = requestedHotel;
      }
    } else {
      const actorHotelId = actor.hotel ? String(actor.hotel) : "";
      if (!actorHotelId) {
        return res.json([]);
      }
      query.hotel = actorHotelId;
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