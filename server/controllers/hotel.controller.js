import Hotel from "../models/Hotels.model.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const hasField = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const parseJsonValue = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const normalizeString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeArrayField = (value) => {
  if (value === undefined || value === null || value === "") return [];

  const parsed = parseJsonValue(value);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter((item) => item !== "" && item !== null && item !== undefined);
  }

  if (typeof parsed === "string") {
    return parsed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [parsed];
};

const getLocationInput = (body = {}) => {
  const output = {};
  const location = parseJsonValue(body.location);

  if (location && typeof location === "object" && !Array.isArray(location)) {
    if (hasField(location, "address")) {
      output.address = normalizeString(location.address) ?? "";
    }
    if (hasField(location, "description")) {
      output.description = normalizeString(location.description) ?? "";
    }
    if (hasField(location, "map_location")) {
      output.map_location = normalizeString(location.map_location) ?? "";
    }
  }

  if (hasField(body, "location.address")) {
    output.address = normalizeString(body["location.address"]) ?? "";
  }
  if (hasField(body, "location.description")) {
    output.description = normalizeString(body["location.description"]) ?? "";
  }
  if (hasField(body, "location.map_location")) {
    output.map_location = normalizeString(body["location.map_location"]) ?? "";
  }

  return output;
};

const getProximityInput = (body = {}) => {
  const output = {};
  const proximity = parseJsonValue(body.proximity);

  if (proximity && typeof proximity === "object" && !Array.isArray(proximity)) {
    if (hasField(proximity, "airport")) {
      const value = normalizeNumber(proximity.airport);
      if (value !== undefined) output.airport = value;
    }
    if (hasField(proximity, "bus_station")) {
      const value = normalizeNumber(proximity.bus_station);
      if (value !== undefined) output.bus_station = value;
    }
    if (hasField(proximity, "train_station")) {
      const value = normalizeNumber(proximity.train_station);
      if (value !== undefined) output.train_station = value;
    }
  }

  if (hasField(body, "proximity.airport")) {
    const value = normalizeNumber(body["proximity.airport"]);
    if (value !== undefined) output.airport = value;
  }
  if (hasField(body, "proximity.bus_station")) {
    const value = normalizeNumber(body["proximity.bus_station"]);
    if (value !== undefined) output.bus_station = value;
  }
  if (hasField(body, "proximity.train_station")) {
    const value = normalizeNumber(body["proximity.train_station"]);
    if (value !== undefined) output.train_station = value;
  }

  return output;
};

const uploadHotelPhotos = async (files = []) => {
  const uploadedPhotos = [];
  for (const file of files) {
    const url = await uploadToCloudinary(file.buffer, "hotels");
    uploadedPhotos.push(url);
  }
  return uploadedPhotos;
};

// ─── GET ALL HOTELS ───────────────────────────────────────────────────────────
// GET /hotels
// Returns paginated hotels. Supports optional ?location and ?amenities filters.
export const getAllHotels = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      amenities,
    } = req.query;

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Number.parseInt(limit, 10) || 10);
    const filters = [];

    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "location.address": { $regex: search, $options: "i" } },
          { "location.description": { $regex: search, $options: "i" } },
        ],
      });
    }

    if (location) {
      filters.push({ "location.address": { $regex: location, $options: "i" } });
    }

    if (amenities) {
      const amenityList = String(amenities)
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      if (amenityList.length > 0) {
        filters.push({ amenities: { $all: amenityList } });
      }
    }

    const queryFilter =
      filters.length === 0
        ? {}
        : filters.length === 1
          ? filters[0]
          : { $and: filters };

    const skip = (pageNumber - 1) * limitNumber;

    const [hotels, total] = await Promise.all([
      Hotel.find(queryFilter)
        .populate("manager", "name email role")
        .populate("receptionists", "name email role")
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Hotel.countDocuments(queryFilter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.max(1, Math.ceil(total / limitNumber)),
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
    const body = req.body || {};
    const name = normalizeString(body.name);
    const locationInput = getLocationInput(body);
    const manager = normalizeString(body.manager);

    if (!name || !locationInput.address || !manager || !mongoose.Types.ObjectId.isValid(manager)) {
      return res.status(400).json({
        success: false,
        message: "name, location.address, and manager are required.",
      });
    }

    const receptionistInput = normalizeArrayField(body.receptionists)
      .map((item) => normalizeString(item))
      .filter(Boolean);

    const hasInvalidReceptionistId = receptionistInput.some(
      (item) => !mongoose.Types.ObjectId.isValid(item)
    );
    if (hasInvalidReceptionistId) {
      return res.status(400).json({
        success: false,
        message: "Invalid receptionist ID.",
      });
    }

    const receptionists = [...new Set(receptionistInput)];
    if (receptionists.includes(manager)) {
      return res.status(400).json({
        success: false,
        message: "Manager cannot be included in receptionist assignments.",
      });
    }

    const [managerUser, receptionistUsers] = await Promise.all([
      User.findById(manager).select("role hotel").lean(),
      receptionists.length > 0
        ? User.find({ _id: { $in: receptionists } }).select("role hotel").lean()
        : [],
    ]);

    if (!managerUser) {
      return res.status(400).json({
        success: false,
        message: "Selected manager does not exist.",
      });
    }

    if (managerUser.role !== "manager") {
      return res.status(400).json({
        success: false,
        message: "Selected manager must have manager role.",
      });
    }

    if (managerUser.hotel) {
      return res.status(400).json({
        success: false,
        message: "Selected manager is already associated with another hotel.",
      });
    }

    if (receptionists.length > 0) {
      if (receptionistUsers.length !== receptionists.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected receptionists do not exist.",
        });
      }

      const hasInvalidReceptionistRole = receptionistUsers.some(
        (user) => user.role !== "receptionist"
      );
      if (hasInvalidReceptionistRole) {
        return res.status(400).json({
          success: false,
          message: "All selected receptionists must have receptionist role.",
        });
      }

      const hasAssignedReceptionist = receptionistUsers.some((user) => user.hotel);
      if (hasAssignedReceptionist) {
        return res.status(400).json({
          success: false,
          message: "All selected receptionists must be available and unassigned.",
        });
      }
    }

    const isTransactionUnsupportedError = (error) => {
      const message = String(error?.message || "");
      return (
        error?.code === 20 ||
        /Transaction numbers are only allowed on a replica set member or mongos/i.test(message)
      );
    };

    const buildHotelFieldUpdate = (hotelId) =>
      hotelId ? { $set: { hotel: hotelId } } : { $unset: { hotel: "" } };

    const receptionistHotelById = new Map(
      receptionistUsers.map((user) => [String(user._id), user.hotel ?? null])
    );

    const syncAssignedUsersToHotel = async (hotelId, session = null) => {
      const updateOptions = session ? { session } : {};

      const managerSyncResult = await User.updateOne(
        { _id: manager, role: "manager" },
        { $set: { hotel: hotelId } },
        updateOptions
      );

      if (managerSyncResult.matchedCount !== 1) {
        const syncError = new Error("Failed to associate manager with the new hotel.");
        syncError.statusCode = 409;
        throw syncError;
      }

      if (receptionists.length > 0) {
        const receptionistSyncResult = await User.updateMany(
          { _id: { $in: receptionists }, role: "receptionist" },
          { $set: { hotel: hotelId } },
          updateOptions
        );

        if (receptionistSyncResult.matchedCount !== receptionists.length) {
          const syncError = new Error(
            "Failed to associate one or more receptionists with the new hotel."
          );
          syncError.statusCode = 409;
          throw syncError;
        }
      }
    };

    const restorePreviousHotelAssignments = async () => {
      await User.updateOne(
        { _id: manager, role: "manager" },
        buildHotelFieldUpdate(managerUser.hotel ?? null)
      );

      if (receptionists.length === 0) {
        return;
      }

      const restoreOps = receptionists.map((receptionistId) => ({
        updateOne: {
          filter: { _id: receptionistId, role: "receptionist" },
          update: buildHotelFieldUpdate(
            receptionistHotelById.get(String(receptionistId)) ?? null
          ),
        },
      }));

      await User.bulkWrite(restoreOps, { ordered: false });
    };

    const amenities = normalizeArrayField(body.amenities)
      .map((item) => normalizeString(item))
      .filter(Boolean);

    const phone = normalizeArrayField(body.phone)
      .map((item) => normalizeString(item))
      .filter(Boolean);

    const website = normalizeString(body.website);
    const proximity = getProximityInput(body);

    const providedPhotos = normalizeArrayField(body.photos)
      .map((item) => normalizeString(item))
      .filter(Boolean);
    const uploadedPhotos = await uploadHotelPhotos(req.files || []);

    const hotelPayload = {
      name,
      location: {
        address: locationInput.address,
        ...(locationInput.description !== undefined
          ? { description: locationInput.description }
          : {}),
        ...(locationInput.map_location !== undefined
          ? { map_location: locationInput.map_location }
          : {}),
      },
      manager,
      receptionists,
      phone,
      amenities,
      photos: [...providedPhotos, ...uploadedPhotos],
    };

    if (website !== undefined) {
      hotelPayload.website = website;
    }
    if (Object.keys(proximity).length > 0) {
      hotelPayload.proximity = proximity;
    }

    let createdHotelId;
    let createdHotel;

    const createWithTransaction = async () => {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const hotel = new Hotel(hotelPayload);
        await hotel.save({ session });
        await syncAssignedUsersToHotel(hotel._id, session);

        await session.commitTransaction();
        createdHotel = hotel;
        createdHotelId = hotel._id;
      } catch (transactionError) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        throw transactionError;
      } finally {
        session.endSession();
      }
    };

    const createWithoutTransaction = async () => {
      const hotel = await Hotel.create(hotelPayload);
      createdHotel = hotel;
      createdHotelId = hotel._id;

      try {
        await syncAssignedUsersToHotel(hotel._id);
      } catch (syncError) {
        await Hotel.deleteOne({ _id: hotel._id });

        try {
          await restorePreviousHotelAssignments();
        } catch {
          // Best-effort compensation for local standalone MongoDB.
        }

        throw syncError;
      }
    };

    try {
      await createWithTransaction();
    } catch (transactionError) {
      if (!isTransactionUnsupportedError(transactionError)) {
        throw transactionError;
      }

      await createWithoutTransaction();
    }

    const populatedHotel = await Hotel.findById(createdHotelId)
      .populate("manager", "name email role")
      .populate("receptionists", "name email role")
      .lean();

    return res.status(201).json({
      success: true,
      data: populatedHotel || createdHotel,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
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

    const body = { ...(req.body || {}) };
    delete body.rooms;
    delete body.booking;
    delete body._id;
    delete body.__v;

    const updateData = {};

    if (hasField(body, "name")) {
      updateData.name = normalizeString(body.name) ?? "";
    }

    if (hasField(body, "manager")) {
      const manager = normalizeString(body.manager);
      if (!manager || !mongoose.Types.ObjectId.isValid(manager)) {
        return res.status(400).json({ success: false, message: "Invalid manager ID." });
      }
      updateData.manager = manager;
    }

    if (hasField(body, "receptionists")) {
      updateData.receptionists = normalizeArrayField(body.receptionists)
        .map((item) => normalizeString(item))
        .filter((item) => item && mongoose.Types.ObjectId.isValid(item));
    }

    if (hasField(body, "phone")) {
      updateData.phone = normalizeArrayField(body.phone)
        .map((item) => normalizeString(item))
        .filter(Boolean);
    }

    if (hasField(body, "amenities")) {
      updateData.amenities = normalizeArrayField(body.amenities)
        .map((item) => normalizeString(item))
        .filter(Boolean);
    }

    if (hasField(body, "website")) {
      updateData.website = normalizeString(body.website) ?? "";
    }

    const locationInput = getLocationInput(body);
    if (hasField(locationInput, "address")) {
      updateData["location.address"] = locationInput.address;
    }
    if (hasField(locationInput, "description")) {
      updateData["location.description"] = locationInput.description;
    }
    if (hasField(locationInput, "map_location")) {
      updateData["location.map_location"] = locationInput.map_location;
    }

    const proximityInput = getProximityInput(body);
    if (hasField(proximityInput, "airport")) {
      updateData["proximity.airport"] = proximityInput.airport;
    }
    if (hasField(proximityInput, "bus_station")) {
      updateData["proximity.bus_station"] = proximityInput.bus_station;
    }
    if (hasField(proximityInput, "train_station")) {
      updateData["proximity.train_station"] = proximityInput.train_station;
    }

    const uploadedPhotos = await uploadHotelPhotos(req.files || []);
    if (hasField(body, "existing_photos") || hasField(body, "photos") || uploadedPhotos.length > 0) {
      const retainedPhotosSource = hasField(body, "existing_photos")
        ? body.existing_photos
        : body.photos;
      const retainedPhotos = retainedPhotosSource !== undefined
        ? normalizeArrayField(retainedPhotosSource)
            .map((item) => normalizeString(item))
            .filter(Boolean)
        : [];

      updateData.photos = [...retainedPhotos, ...uploadedPhotos];
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No update fields provided." });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("manager", "name email role")
      .populate("receptionists", "name email role")
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