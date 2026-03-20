import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Bill from "../models/Bill.js";
import Room from "../models/Room.js";
import Service from "../models/Service.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import { calculateBill } from "../utils/billCalculator.js";
import { sendBookingMail, sendInvoiceMail } from "../utils/mail.js";

// Read endpoints
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("guest_id")
      .populate("room_id")
      .populate("bill_id")
      .populate("services")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("guest_id")
      .populate("room_id")
      .populate("bill_id")
      .populate("services");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// Update endpoint
export const updateBooking = async (req, res, next) => {
  try {
    const { room_id, expected_checkout, booking_source, notes, advance_paid } =
      req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Room swap logic
    if (room_id && room_id !== booking.room_id.toString()) {
      const newRoom = await Room.findById(room_id);
      if (!newRoom || newRoom.availability !== "available") {
        return res.status(400).json({ message: "New room is not available" });
      }

      // If currently checked-in, free the old room and occupy the new one
      if (booking.status === "checked-in") {
        await Room.findByIdAndUpdate(booking.room_id, {
          availability: "available",
        });
        await Room.findByIdAndUpdate(room_id, { availability: "occupied" });
      }

      booking.room_id = room_id;
    }

    // Update details
    if (expected_checkout) booking.expected_checkout = expected_checkout;
    if (booking_source) booking.booking_source = booking_source;
    if (notes !== undefined) booking.notes = notes;
    if (advance_paid !== undefined) booking.advance_paid = advance_paid;

    await booking.save();

    // Optionally update Bill if advance_paid changed
    if (advance_paid !== undefined) {
      const bill = await Bill.findById(booking.bill_id);
      if (bill) {
        bill.amount_paid = advance_paid;
        bill.remaining_amount = bill.total_amount - bill.amount_paid;
        
        if (bill.amount_paid >= bill.total_amount && bill.total_amount > 0) {
          bill.status = "paid";
        } else if (bill.amount_paid > 0) {
          bill.status = "partial";
        } else {
          bill.status = "unpaid";
        }
        
        await bill.save();
      }
    }

    const updatedBooking = await Booking.findById(req.params.id)
      .populate("guest_id")
      .populate("room_id")
      .populate("bill_id");

    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      room_id,
      guest_id,
      expected_checkout,
      booking_source,
      notes,
      advance_paid,
    } = req.body;

    const room = await Room.findById(room_id);
    if (!room || room.availability !== "available") {
      return res.status(400).json({ message: "Room not available" });
    }

    const bookingId = new mongoose.Types.ObjectId();
    const billId = new mongoose.Types.ObjectId();

    const advance = advance_paid ? Number(advance_paid) : 0;
    const invoiceNumber = await generateInvoiceNumber();

    const bill = new Bill({
      _id: billId,
      booking_id: bookingId,
      room_charge: 0,
      services_charge: 0,
      tax_amount: 0,
      total_amount: 0,
      amount_paid: advance,
      remaining_amount: -advance,
      status: advance > 0 ? "partial" : "unpaid",
      invoice_number: invoiceNumber,
    });

    const booking = new Booking({
      _id: bookingId,
      room_id,
      guest_id,
      bill_id: billId,
      check_in_date: new Date(),
      expected_checkout,
      status: "booked",
      booking_source,
      advance_paid: advance,
      notes,
      created_by: req.user.id,
    });

    await bill.save();
    await booking.save();

    // Send the Welcome/Booking Confirmation Email asynchronously
    try {
      const populatedBooking = await Booking.findById(booking._id).populate("guest_id").populate("room_id");
      if (populatedBooking && populatedBooking.guest_id && populatedBooking.guest_id.email) {
        await sendBookingMail({
          to: populatedBooking.guest_id.email,
          guestName: `${populatedBooking.guest_id.first_name} ${populatedBooking.guest_id.last_name}`,
          bookingId: populatedBooking._id.toString(),
          roomType: populatedBooking.room_id?.room_number || "Selected Room",
          checkInDate: new Date().toLocaleDateString(),
          checkOutDate: new Date(expected_checkout).toLocaleDateString()
        });
      }
    } catch (mailError) {
      console.error("Error sending booking email:", mailError);
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.status !== "booked") {
      return res.status(400).json({ message: "Invalid booking for check-in" });
    }

    booking.status = "checked-in";
    booking.check_in_date = new Date(); // Update actual check-in
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, { availability: "occupied" });

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("services");
    if (!booking || booking.status !== "checked-in") {
      return res
        .status(400)
        .json({ message: "Can only check-out checked-in bookings" });
    }

    booking.status = "checked-out";
    booking.check_out_date = new Date();
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, {
      availability: "available",
    });

    const room = await Room.findById(booking.room_id);
    const nights =
      Math.ceil(
        (booking.check_out_date - booking.check_in_date) /
          (1000 * 60 * 60 * 24),
      ) || 1;

    const bill = await Bill.findById(booking.bill_id);
    const calc = calculateBill({
      roomPricePerNight: room.price.per_night,
      nights,
      services: booking.services,
      discount: bill.discount || 0,
      taxPercent: room.price.tax_percent,
    });

    bill.room_charge = calc.roomTotal || 0;
    bill.services_charge = calc.servicesTotal || 0;
    bill.total_amount = calc.total;
    bill.tax_amount = calc.taxAmount || 0;
    bill.remaining_amount = bill.total_amount - (bill.amount_paid || 0);

    if (bill.amount_paid >= bill.total_amount && bill.total_amount > 0) {
      bill.status = "paid";
    } else if (bill.amount_paid > 0) {
      bill.status = "partial";
    }

    await bill.save();

    // Send the Checkout/Thank You Invoice Email asynchronously
    try {
      const populatedBooking = await Booking.findById(booking._id).populate("guest_id");
      if (populatedBooking && populatedBooking.guest_id && populatedBooking.guest_id.email) {
        await sendInvoiceMail({
          to: populatedBooking.guest_id.email,
          guestName: `${populatedBooking.guest_id.first_name} ${populatedBooking.guest_id.last_name}`,
          billId: bill.invoice_number || bill._id.toString(),
          totalAmount: bill.total_amount.toString(),
          checkOutDate: new Date().toLocaleDateString()
        });
      }
    } catch (mailError) {
      console.error("Error sending invoice email:", mailError);
    }

    res.json({ booking, bill });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.status !== "booked") {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Bill will remain as a cancelled stub
    const bill = await Bill.findById(booking.bill_id);
    if (bill) {
      bill.status = "cancelled";
      await bill.save();
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const addService = async (req, res, next) => {
  try {
    const { name, category, price, quantity, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const service = new Service({
      booking_id: booking._id,
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      notes,
    });

    await service.save();
    booking.services.push(service._id);
    await booking.save();

    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const removeService = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Service.findByIdAndDelete(req.params.serviceId);

    booking.services = booking.services.filter(
      (s) => s.toString() !== req.params.serviceId,
    );
    await booking.save();

    res.json({ message: "Service removed" });
  } catch (error) {
    next(error);
  }
};
