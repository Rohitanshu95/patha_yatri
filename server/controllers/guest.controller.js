import Guest from "../models/Guest.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const registerGuest = async (req, res, next) => {
  try {
    const data = req.body;
    let idProofUrl = null;

    if (req.file) {
      idProofUrl = await uploadToCloudinary(req.file.buffer, "guests-id-proofs");
    }

    const guestData = {
      name: data.name,
      contact: data.contact,
      email: data.email,
      address: data.address,
      documents: {
        id_proof: data.id_proof,
        number: data.document_number,
        file_url: idProofUrl,
      },
      occupants: {
        total: (Number(data.occupants_adults_male) || 0) + (Number(data.occupants_adults_female) || 0) + (Number(data.occupants_children) || 0),
        adults: {
          count: (Number(data.occupants_adults_male) || 0) + (Number(data.occupants_adults_female) || 0),
          male: Number(data.occupants_adults_male) || 0,
          female: Number(data.occupants_adults_female) || 0,
        },
        children: Number(data.occupants_children) || 0,
      }
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
    
    // Address updates
    if (data.street || data.city || data.state || data.zip_code || data.country) {
      data.address = {
        street: data.street,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country,
      };
    }

    // ID proof updates
    if (data.id_proof_type || data.id_proof_number || req.file) {
       data.id_proof = data.id_proof || {};
       if (data.id_proof_type) data.id_proof.type = data.id_proof_type;
       if (data.id_proof_number) data.id_proof.document_number = data.id_proof_number;
       if (req.file) {
         data.id_proof.file_url = await uploadToCloudinary(req.file.buffer, "guests-id-proofs");
       }
    }

    const guest = await Guest.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    res.json(guest);
  } catch (error) {
    next(error);
  }
};