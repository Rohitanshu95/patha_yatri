import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Hotel from "../models/Hotels.model.js";
import mongoose from "mongoose";

const ALLOWED_ROLES = new Set(["admin", "manager", "receptionist"]);
const SORT_FIELDS = new Set(["createdAt", "name", "email", "role", "lastLogin", "isActive"]);
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseRoles = (roleParam) => {
  if (!roleParam) return [];

  const parsed = String(roleParam)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => ALLOWED_ROLES.has(value));

  return [...new Set(parsed)];
};

const applyRoleScope = (requestedRoles, actorRole) => {
  if (actorRole === "manager") {
    return ["receptionist"];
  }

  return requestedRoles;
};

const canManagerMutateRole = (targetRole) => targetRole === "receptionist";

const normalizeHotelId = (value) => {
  if (value === undefined || value === null) return null;

  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "all") return null;

  if (!objectIdRegex.test(trimmed)) return "__invalid__";
  return trimmed;
};

const getActorContext = async (req) => {
  if (!req.user?.id) return null;
  return User.findById(req.user.id).select("role hotel").lean();
};

const getHotelId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    return String(value);
  }
  return String(value);
};

const ensureHotelExists = async (hotelId) => {
  if (!hotelId) return true;
  const hotel = await Hotel.exists({ _id: hotelId });
  return Boolean(hotel);
};

const parseSort = (sortParam) => {
  if (!sortParam) {
    return { createdAt: -1 };
  }

  const [fieldRaw, directionRaw] = String(sortParam).split(":");
  const field = (fieldRaw || "").trim();
  const direction = (directionRaw || "desc").trim().toLowerCase();

  if (!SORT_FIELDS.has(field)) {
    return { createdAt: -1 };
  }

  return { [field]: direction === "asc" ? 1 : -1 };
};

const toSafeUser = (user) => {
  const userObj = user?.toObject ? user.toObject() : { ...(user || {}) };
  delete userObj.password;
  return userObj;
};

export const listUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      hotel,
      status = "all",
      search,
      sort,
    } = req.query;

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const actorRole = req.user?.role;
    const requestedRoles = parseRoles(role);
    const scopedRoles = applyRoleScope(requestedRoles, actorRole);
    const requestedHotel = normalizeHotelId(hotel);

    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    const filter = {};

    if (scopedRoles.length === 1) {
      filter.role = scopedRoles[0];
    } else if (scopedRoles.length > 1) {
      filter.role = { $in: scopedRoles };
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    if (actorRole === "manager") {
      const actor = await getActorContext(req);
      const actorHotelId = getHotelId(actor?.hotel);

      if (!actorHotelId) {
        return res.json({
          data: [],
          pagination: {
            total: 0,
            page: pageNumber,
            pages: 1,
            limit: limitNumber,
          },
        });
      }

      filter.hotel = actorHotelId;
    } else if (requestedHotel) {
      filter.hotel = requestedHotel;
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortQuery = parseSort(sort);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("hotel", "name location.address")
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      data: users,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.max(1, Math.ceil(total / limitNumber)),
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listUserOptions = async (req, res, next) => {
  try {
    const { role, includeInactive = "false" } = req.query;
    const actorRole = req.user?.role;
    const requestedRoles = parseRoles(role);
    const scopedRoles = applyRoleScope(requestedRoles, actorRole);

    const filter = {};

    if (scopedRoles.length === 1) {
      filter.role = scopedRoles[0];
    } else if (scopedRoles.length > 1) {
      filter.role = { $in: scopedRoles };
    }

    if (includeInactive !== "true") {
      filter.isActive = true;
    }

    const users = await User.find(filter)
      .select("name email role isActive hotel")
      .sort({ name: 1 })
      .lean();

    return res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const actorRole = actor.role;
    const actorHotelId = getHotelId(actor.hotel);

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password, role } = req.body;
    const requestedHotel = normalizeHotelId(req.body.hotel);

    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    let assignedHotelId = requestedHotel;

    if (actorRole === "manager" && role !== "receptionist") {
      return res.status(403).json({ message: "Managers can only create receptionist accounts" });
    }

    if (actorRole === "manager") {
      if (!actorHotelId) {
        return res.status(403).json({ message: "Your account is not assigned to any hotel" });
      }
      if (requestedHotel && requestedHotel !== actorHotelId) {
        return res.status(403).json({ message: "Managers can only assign users to their own hotel" });
      }
      assignedHotelId = actorHotelId;
    }

    if (assignedHotelId) {
      const exists = await ensureHotelExists(assignedHotelId);
      if (!exists) {
        return res.status(400).json({ message: "Selected hotel does not exist" });
      }
    }

    const shouldSyncHotelReceptionists =
      actorRole === "manager" && role === "receptionist" && Boolean(assignedHotelId);

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUserDoc = () =>
      new User({
        name,
        email,
        password: hashedPassword,
        role,
        hotel: assignedHotelId || undefined,
      });

    const createSyncError = (message) => {
      const syncError = new Error(message);
      syncError.statusCode = 409;
      return syncError;
    };

    const isTransactionUnsupportedError = (error) => {
      const message = String(error?.message || "");
      return (
        error?.code === 20 ||
        /Transaction numbers are only allowed on a replica set member or mongos/i.test(message)
      );
    };

    const syncReceptionistToHotel = async (newUserId, session = null) => {
      if (!shouldSyncHotelReceptionists) return;

      const syncOptions = session ? { session } : {};
      const hotelSyncResult = await Hotel.updateOne(
        { _id: assignedHotelId },
        { $addToSet: { receptionists: newUserId } },
        syncOptions
      );

      if (hotelSyncResult.matchedCount !== 1) {
        throw createSyncError("Failed to associate receptionist with manager hotel");
      }
    };

    const createWithTransaction = async () => {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const createdUser = createUserDoc();
        await createdUser.save({ session });
        await syncReceptionistToHotel(createdUser._id, session);

        await session.commitTransaction();
        return createdUser;
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
      const createdUser = createUserDoc();
      await createdUser.save();

      try {
        await syncReceptionistToHotel(createdUser._id);
      } catch (syncError) {
        await User.deleteOne({ _id: createdUser._id });
        throw syncError;
      }

      return createdUser;
    };

    try {
      user = await createWithTransaction();
    } catch (transactionError) {
      if (!isTransactionUnsupportedError(transactionError)) {
        throw transactionError;
      }

      user = await createWithoutTransaction();
    }

    await user.populate("hotel", "name location.address");

    return res.status(201).json({
      message: "User created successfully",
      user: toSafeUser(user),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const actorRole = actor.role;
    const actorHotelId = getHotelId(actor.hotel);
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetHotelId = getHotelId(targetUser.hotel);

    if (actorRole === "manager" && !canManagerMutateRole(targetUser.role)) {
      return res.status(403).json({ message: "Managers can only manage receptionist accounts" });
    }

    if (actorRole === "manager") {
      if (!actorHotelId) {
        return res.status(403).json({ message: "Your account is not assigned to any hotel" });
      }
      if (targetHotelId !== actorHotelId) {
        return res.status(403).json({ message: "Managers can only manage users in their own hotel" });
      }
    }

    const name = req.body.name !== undefined ? String(req.body.name).trim() : undefined;
    const email = req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined;
    const { role, isActive } = req.body;
    const hasHotelField = Object.prototype.hasOwnProperty.call(req.body, "hotel");
    const requestedHotel = hasHotelField ? normalizeHotelId(req.body.hotel) : null;

    if (requestedHotel === "__invalid__") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }

    if (actorRole === "manager" && role !== undefined && role !== "receptionist") {
      return res.status(403).json({ message: "Managers can only assign receptionist role" });
    }

    if (actorRole === "manager" && hasHotelField && requestedHotel && requestedHotel !== actorHotelId) {
      return res.status(403).json({ message: "Managers can only assign users to their own hotel" });
    }

    if (String(id) === String(req.user?.id) && isActive === false) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }

    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const nextRole = role !== undefined ? role : targetUser.role;
    const nextHotelId = actorRole === "manager"
      ? actorHotelId
      : hasHotelField
        ? requestedHotel
        : targetHotelId;

    if ((nextRole === "manager" || nextRole === "receptionist") && !nextHotelId) {
      return res.status(400).json({ message: "Hotel is required for manager and receptionist accounts" });
    }

    if (nextHotelId) {
      const exists = await ensureHotelExists(nextHotelId);
      if (!exists) {
        return res.status(400).json({ message: "Selected hotel does not exist" });
      }
    }

    if (name !== undefined) targetUser.name = name;
    if (email !== undefined) targetUser.email = email;
    if (role !== undefined) targetUser.role = role;
    if (isActive !== undefined) targetUser.isActive = isActive;
    if (actorRole === "manager") {
      targetUser.hotel = actorHotelId;
    } else if (hasHotelField) {
      targetUser.hotel = nextHotelId || undefined;
    }

    await targetUser.save();
    await targetUser.populate("hotel", "name location.address");

    return res.json({
      message: "User updated successfully",
      user: toSafeUser(targetUser),
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const actorRole = actor.role;
    const actorHotelId = getHotelId(actor.hotel);

    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (actorRole === "manager" && !canManagerMutateRole(user.role)) {
      return res.status(403).json({ message: "Managers can only manage receptionist accounts" });
    }

    if (actorRole === "manager") {
      if (!actorHotelId) {
        return res.status(403).json({ message: "Your account is not assigned to any hotel" });
      }

      if (getHotelId(user.hotel) !== actorHotelId) {
        return res.status(403).json({ message: "Managers can only manage users in their own hotel" });
      }
    }

    if (!user.isActive) {
      return res.json({ message: "User is already inactive", user: toSafeUser(user) });
    }

    user.isActive = false;
    await user.save();

    return res.json({ message: "User deactivated successfully", user: toSafeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actor = await getActorContext(req);
    if (!actor) {
      return res.status(401).json({ message: "User not found" });
    }

    const actorRole = actor.role;
    const actorHotelId = getHotelId(actor.hotel);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (actorRole === "manager" && !canManagerMutateRole(user.role)) {
      return res.status(403).json({ message: "Managers can only manage receptionist accounts" });
    }

    if (actorRole === "manager") {
      if (!actorHotelId) {
        return res.status(403).json({ message: "Your account is not assigned to any hotel" });
      }

      if (getHotelId(user.hotel) !== actorHotelId) {
        return res.status(403).json({ message: "Managers can only manage users in their own hotel" });
      }
    }

    if (user.isActive) {
      return res.json({ message: "User is already active", user: toSafeUser(user) });
    }

    user.isActive = true;
    await user.save();

    return res.json({ message: "User activated successfully", user: toSafeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

