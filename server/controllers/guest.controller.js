import Guest from "../models/Guest.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const registerGuest = async (req, res, next) => {
  try {
    const data = req.body;
    let idProofUrl = null;

    if (req.file) {
      idProofUrl = await uploadToCloudinary(req.file.buffer, "guests-id-proofs");
    }

    const idProofType = data.id_proof || null;
    const documentNumber = data.document_number || null;
    const hasDocs = Boolean(idProofType || documentNumber || idProofUrl);

    const adultsMale = Number(data.occupants_adults_male) || 0;
    const adultsFemale = Number(data.occupants_adults_female) || 0;
    const adultsFallback = Number(data.occupants_adults) || 0;
    const adultsCount = adultsMale + adultsFemale || adultsFallback || 1;
    const adultsMaleCount = adultsMale || (adultsFallback ? adultsFallback : 1);
    const adultsFemaleCount = adultsFemale || (adultsFallback ? 0 : 0);
    const childrenCount = Number(data.occupants_children) || 0;
    const totalOccupants = adultsCount + childrenCount;

    const guestData = {
      name: data.name,
      contact: data.contact,
      email: data.email,
      address: data.address,
      documents: hasDocs
        ? {
            id_proof: idProofType,
            number: documentNumber,
            file_url: idProofUrl,
          }
        : undefined,
      occupants: {
        total: totalOccupants,
        adults: {
          count: adultsCount,
          male: adultsMaleCount,
          female: adultsFemaleCount,
        },
        children: childrenCount,
      },
      verification_status:
        idProofType && documentNumber && idProofUrl ? "verified" : "pending",
    };

    const guest = new Guest(guestData);
    await guest.save();

    res.status(201).json(guest);
  } catch (error) {
    next(error);
  }
};

export const listGuests = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { first_name: new RegExp(search, "i") },
        { last_name: new RegExp(search, "i") },
        { phone_number: new RegExp(search, "i") },
      ];
    }
    const guests = await Guest.find(filter).lean();
    res.json(guests);
  } catch (error) {
    next(error);
  }
};

export const getGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req, res, next) => {
  try {
    const data = req.body;

    // ID proof updates
    if (data.id_proof_type || data.id_proof_number || req.file) {
      data.documents = data.documents || {};
      if (data.id_proof_type) data.documents.id_proof = data.id_proof_type;
      if (data.id_proof_number) data.documents.number = data.id_proof_number;
      if (req.file) {
        data.documents.file_url = await uploadToCloudinary(req.file.buffer, "guests-id-proofs");
      }
    }

    const guest = await Guest.findOneAndUpdate({ _id: req.params.id }, data, { new: true });
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    res.json(guest);
  } catch (error) {
    next(error);
  }
};