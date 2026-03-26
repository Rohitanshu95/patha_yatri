import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Bill from "../models/Bill.js";
import Guest from "../models/Guest.js";
import Payment from "../models/Payment.js";
import Room from "../models/Room.js";
import Service from "../models/Service.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import { calculateBill } from "../utils/billCalculator.js";
import {
  sendBookingConfirmation,
  sendCheckoutReminder,
} from "../utils/sms.js";
import {
  sendBookingMail,
  sendInvoiceMail,
  sendCancellationMail,
} from "../utils/mail.js";
import { generateInvoicePdf } from "../utils/pdf/invoicePdf.js";

const getBillStatus = (totalAmount, amountPaid) => {
  if (totalAmount > 0 && amountPaid >= totalAmount) return "paid";
  if (amountPaid > 0) return "partial";
  return "unpaid";
};

const calculateNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = 1000 * 60 * 60 * 24;
const STANDARD_CHECKIN_HOUR = Number(process.env.STANDARD_CHECKIN_HOUR ?? 12);

const getHourlyRate = (room) => {
  const perHour = Number(room?.price?.per_hour);
  if (Number.isFinite(perHour) && perHour > 0) return perHour;
  const perNight = Number(room?.price?.per_night);
  if (Number.isFinite(perNight) && perNight > 0) return perNight / 24;
  return 0;
};

const getStandardTime = (date, hour) => {
  const standard = new Date(date);
  if (Number.isNaN(standard.getTime())) return null;
  standard.setHours(hour, 0, 0, 0);
  return standard;
};

const calculateEarlyCheckInSurcharge = ({ checkInDate, room }) => {
  if (!checkInDate) return 0;
  const actual = new Date(checkInDate);
  const standard = getStandardTime(actual, STANDARD_CHECKIN_HOUR);
  if (!standard || actual >= standard) return 0;
  const diffMs = standard.getTime() - actual.getTime();
  const hours = Math.ceil(diffMs / HOUR_MS);
  return hours * getHourlyRate(room);
};

const calculateLateCheckoutSurcharge = ({ expectedCheckout, actualCheckout, room }) => {
  if (!expectedCheckout || !actualCheckout) return 0;
  const expected = new Date(expectedCheckout);
  const actual = new Date(actualCheckout);
  if (Number.isNaN(expected.getTime()) || Number.isNaN(actual.getTime())) return 0;
  if (actual <= expected) return 0;

  const diffMs = actual.getTime() - expected.getTime();
  const perHour = Number(room?.price?.per_hour);
  if (Number.isFinite(perHour) && perHour > 0) {
    const hours = Math.ceil(diffMs / HOUR_MS);
    return hours * perHour;
  }

  const perNight = Number(room?.price?.per_night);
  if (Number.isFinite(perNight) && perNight > 0) {
    const extraNights = Math.ceil(diffMs / DAY_MS);
    return extraNights * perNight;
  }

  return 0;
};

const recalcBillForBooking = async ({
  booking,
  bill,
  room,
  services,
  surcharge = 0,
}) => {
  const endDate =
    booking.check_out_date || booking.expected_checkout || new Date();
  const nights = calculateNights(booking.check_in_date, endDate);
  const calc = calculateBill({
    roomPricePerNight: room?.price?.per_night,
    nights,
    services,
    discount: bill?.discount?.amount || 0,
    taxPercent: room?.price?.tax_percent,
    surcharge,
    applyRounding: true,
  });

  bill.room_charge = Number(calc.roomTotal) || 0;
  bill.services_charge = Number(calc.servicesTotal) || 0;
  bill.tax_amount = Number(calc.taxAmount) || 0;
  bill.total_amount = Number(calc.total) || 0;
  bill.roundoff_amount = Number(calc.roundoffAmount) || 0;
  bill.payable_amount = Number(calc.payableTotal) || 0;

  const amountPaid = Number(bill.amount_paid) || 0;
  const payableAmount = Number(bill.payable_amount) || bill.total_amount;
  bill.remaining_amount = Math.max(0, payableAmount - amountPaid);
  bill.status = getBillStatus(payableAmount, amountPaid);

  await bill.save();
  return bill;
};

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

    let shouldRecalc = false;

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
      shouldRecalc = true;
    }

    // Update details
    if (expected_checkout) {
      booking.expected_checkout = expected_checkout;
      shouldRecalc = true;
    }
    if (booking_source) booking.booking_source = booking_source;
    if (notes !== undefined) booking.notes = notes;
    if (advance_paid !== undefined) {
      booking.advance_paid = advance_paid;
      shouldRecalc = true;
    }

    await booking.save();

    if (shouldRecalc) {
      const bill = await Bill.findById(booking.bill_id);
      if (bill) {
        if (advance_paid !== undefined) {
          bill.amount_paid = Number(advance_paid) || 0;
        }
        const bookingWithServices = await Booking.findById(booking._id)
          .populate("services")
          .select(
            "services check_in_date check_out_date expected_checkout room_id",
          );
        const room = await Room.findById(booking.room_id);
        await recalcBillForBooking({
          booking: bookingWithServices,
          bill,
          room,
          services: bookingWithServices?.services || [],
        });
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
      check_in_date,
      expected_checkout,
      booking_source,
      notes,
      advance_paid,
      payment_method,
      payment_note,
    } = req.body;

    let checkInDate = check_in_date ? new Date(check_in_date) : new Date();
    if (Number.isNaN(checkInDate.getTime())) {
      checkInDate = new Date();
    }
    const expectedCheckoutDate = expected_checkout
      ? new Date(expected_checkout)
      : null;

    if (!expectedCheckoutDate || expectedCheckoutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: "Checkout must be after check-in" });
    }

    const room = await Room.findById(room_id);
    if (!room || room.availability !== "available") {
      return res.status(400).json({ message: "Room not available" });
    }

    const bookingId = new mongoose.Types.ObjectId();
    const billId = new mongoose.Types.ObjectId();

    const advance = advance_paid ? Number(advance_paid) : 0;
    const invoiceNumber = await generateInvoiceNumber();

    const nights = calculateNights(checkInDate, expectedCheckoutDate);
    const initialCalc = calculateBill({
      roomPricePerNight: room.price?.per_night,
      nights,
      services: [],
      discount: 0,
      taxPercent: room.price?.tax_percent,
      applyRounding: true,
    });
    const initialTotal = Number(initialCalc.total) || 0;
    const initialPayable = Number(initialCalc.payableTotal) || initialTotal;
    const initialRemaining = Math.max(0, initialPayable - advance);
    const initialStatus = getBillStatus(initialPayable, advance);

    const bill = new Bill({
      _id: billId,
      booking_id: bookingId,
      room_charge: Number(initialCalc.roomTotal) || 0,
      services_charge: Number(initialCalc.servicesTotal) || 0,
      tax_amount: Number(initialCalc.taxAmount) || 0,
      total_amount: initialTotal,
      roundoff_amount: Number(initialCalc.roundoffAmount) || 0,
      payable_amount: Number(initialCalc.payableTotal) || initialTotal,
      amount_paid: advance,
      remaining_amount: initialRemaining,
      status: initialStatus,
      invoice_number: invoiceNumber,
    });

    const booking = new Booking({
      _id: bookingId,
      room_id,
      guest_id,
      bill_id: billId,
      check_in_date: checkInDate,
      expected_checkout: expectedCheckoutDate,
      status: "booked",
      booking_source,
      advance_paid: advance,
      notes,
      created_by: req.user.id,
    });

    await bill.save();
    await booking.save();

    if (booking?.guest_id) {
      const guest = await Guest.findById(booking.guest_id);
      const room = await Room.findById(booking.room_id);
      if (guest?.email) {
        try {
          await sendBookingMail({
            to: guest.email,
            guestName: guest.name || "Guest",
            bookingId: booking._id.toString(),
            roomType: room?.room_category || room?.name || "Room",
            checkInDate: checkInDate.toLocaleDateString("en-IN"),
            checkOutDate: expectedCheckoutDate.toLocaleDateString("en-IN"),
          });
        } catch (error) {
          console.error("❌ Booking email failed:", error);
        }
      } else {
        console.warn("⚠️ Booking email skipped: guest email missing");
      }

      if (guest?.contact && room) {
        try {
          await sendBookingConfirmation(`+91${guest.contact}`, {
            roomNumber: room.room_number,
            roomCategory: room.room_category || room.name,
            checkInDate: checkInDate.toLocaleDateString("en-IN"),
            checkOutDate: expectedCheckoutDate.toLocaleDateString("en-IN"),
          });
        } catch (error) {
          console.error("❌ Booking SMS failed:", error);
        }
      }
    }

    if (advance > 0) {
      const rawMethod = String(payment_method || "").toLowerCase();
      let method = "cash";
      if (rawMethod.includes("upi")) method = "UPI";
      else if (rawMethod.includes("card")) method = "card";
      else if (rawMethod.includes("online")) method = "online_gateway";

      const note = payment_note?.toString().trim();
      const payment = new Payment({
        bill_id: billId,
        booking_id: bookingId,
        method,
        amount: advance,
        payment_date: new Date(),
        status: "success",
        collected_by: req.user.id,
        notes: note || "Advance payment collected at booking",
      });

      await payment.save();
      bill.payments = bill.payments || [];
      bill.payments.push(payment._id);
      await bill.save();
    }

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("bill_id");
    if (!booking || booking.status !== "booked" || booking.bill_id.status === "paid") {
      return res.status(400).json({ message: "Invalid booking for check-in" });
    }

    const guest = await Guest.findById(booking.guest_id);
    if (!guest) {
      return res.status(400).json({ message: "Guest not found" });
    }
    const hasVerifiedDocs = Boolean(
      guest?.documents?.id_proof &&
      guest?.documents?.number &&
      guest?.documents?.file_url,
    );
    const isVerified =
      guest?.verification_status === "verified" || hasVerifiedDocs;

    if (!isVerified) {
      return res.status(400).json({
        message:
          "Guest verification pending. Please upload ID proof before check-in.",
      });
    }

    booking.status = "checked-in";
    booking.check_in_date = new Date(); // Update actual check-in
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, { availability: "occupied" });

    const room = await Room.findById(booking.room_id);
    const bill = await Bill.findById(booking.bill_id);

    if (guest?.contact && room) {
      try {
        await sendBookingConfirmation(`+91${guest.contact}`, {
          roomNumber: room.room_number,
          roomCategory: room.room_category || room.name,
          checkInDate: booking.check_in_date?.toLocaleDateString("en-IN"),
          checkOutDate: booking.expected_checkout?.toLocaleDateString("en-IN"),
        });
      } catch (error) {
        console.error("❌ Check-in SMS failed:", error);
      }
    }

    // if (bill && room) {
    //   const bookingWithServices = await Booking.findById(booking._id)
    //     .populate("services")
    //     .select("services check_in_date check_out_date expected_checkout room_id");
    //   const earlySurcharge = calculateEarlyCheckInSurcharge({
    //     checkInDate: booking.check_in_date,
    //     room,
    //   });
    //   await recalcBillForBooking({
    //     booking: bookingWithServices,
    //     bill,
    //     room,
    //     services: bookingWithServices?.services || [],
    //     surcharge: earlySurcharge,
    //   });
    // }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "services guest_id room_id",
    );
    if (!booking || booking.status !== "checked-in") {
      return res
        .status(400)
        .json({ message: "Can only check-out, checked-in bookings" });
    }

    booking.status = "checked-out";
    booking.check_out_date = new Date();
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, {
      availability: "available",
    });

    const room = booking?.room_id?.price
      ? booking.room_id
      : await Room.findById(booking.room_id);
    const bill = await Bill.findById(booking.bill_id);
    if (bill) {
      if (!bill.finalized_at) {
        bill.finalized_at = new Date();
      }
      // const earlySurcharge = calculateEarlyCheckInSurcharge({
      //   checkInDate: booking.check_in_date,
      //   room,
      // });
      // const lateSurcharge = calculateLateCheckoutSurcharge({
      //   expectedCheckout: booking.expected_checkout,
      //   actualCheckout: booking.check_out_date,
      //   room,
      // });
      // const totalSurcharge = earlySurcharge + lateSurcharge;
      await recalcBillForBooking({
        booking,
        bill,
        room,
        services: booking.services || [],
        // surcharge: totalSurcharge,
      });
    }

    const guest = booking?.guest_id?.email
      ? booking.guest_id
      : await Guest.findById(booking.guest_id);
    if (guest?.email && bill) {
      const payableAmount =
        Number(bill.payable_amount) || bill.total_amount || 0;
      try {
        const payments = await Payment.find({ bill_id: bill._id })
          .sort({ payment_date: -1, createdAt: -1 })
          .limit(1);
        const pdfBuffer = await generateInvoicePdf({
          booking,
          bill,
          room,
          payments,
        });
        await sendInvoiceMail({
          to: guest.email,
          guestName: guest.name || "Guest",
          billId: bill.invoice_number || bill._id.toString(),
          totalAmount: payableAmount.toLocaleString("en-IN"),
          checkOutDate: booking.check_out_date.toLocaleDateString("en-IN"),
          attachments: [
            {
              filename: `invoice-${bill.invoice_number || bill._id}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (error) {
        console.error("❌ Invoice email failed:", error);
      }
    } else if (!guest?.email) {
      console.warn("⚠️ Invoice email skipped: guest email missing");
    }

    if (guest?.contact) {
      try {
        await sendCheckoutReminder(guest.contact, {
          roomNumber: room?.room_number,
          roomCategory: room?.room_category || room?.name,
          checkInDate: booking.check_in_date?.toLocaleDateString("en-IN"),
          checkOutDate: booking.check_out_date?.toLocaleDateString("en-IN"),
        });
      } catch (error) {
        console.error("❌ Checkout SMS failed:", error);
      }
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

    const guest = await Guest.findById(booking.guest_id);
    const room = await Room.findById(booking.room_id);
    if (guest?.email) {
      try {
        await sendCancellationMail({
          to: guest.email,
          guestName: guest.name || "Guest",
          bookingId: booking._id.toString(),
          roomType: room?.room_category || room?.name || "Room",
          cancelledAt: new Date().toLocaleDateString("en-IN"),
        });
      } catch (error) {
        console.error("❌ Cancellation email failed:", error);
      }
    } else {
      console.warn("⚠️ Cancellation email skipped: guest email missing");
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const addService = async (req, res, next) => {
  try {
    const {
      name,
      type,
      category,
      unit_price,
      price,
      quantity,
      description,
      notes,
      served_at,
    } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const rawType = (type || category || "other").toString().toLowerCase();
    const typeMap = {
      food: "fooding",
      fooding: "fooding",
      laundry: "laundry",
      spa: "spa",
      transport: "other",
      other: "other",
    };
    const serviceType = typeMap[rawType] || "other";

    const unitPrice = Number(unit_price ?? price) || 0;
    const qty = Number(quantity) || 1;
    const totalPrice = unitPrice * qty;

    const service = new Service({
      booking_id: booking._id,
      name,
      type: serviceType,
      unit_price: unitPrice,
      quantity: qty,
      total_price: totalPrice,
      description: description ?? notes,
      served_at: served_at ? new Date(served_at) : new Date(),
      added_by: req.user.id,
    });

    await service.save();
    booking.services.push(service._id);
    await booking.save();

    const bill = await Bill.findById(booking.bill_id);
    if (bill) {
      const bookingWithServices = await Booking.findById(booking._id)
        .populate("services")
        .select(
          "services check_in_date check_out_date expected_checkout room_id",
        );
      const room = await Room.findById(booking.room_id);
      await recalcBillForBooking({
        booking: bookingWithServices,
        bill,
        room,
        services: bookingWithServices?.services || [],
      });
    }

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

    const bill = await Bill.findById(booking.bill_id);
    if (bill) {
      const bookingWithServices = await Booking.findById(booking._id)
        .populate("services")
        .select(
          "services check_in_date check_out_date expected_checkout room_id",
        );
      const room = await Room.findById(booking.room_id);
      await recalcBillForBooking({
        booking: bookingWithServices,
        bill,
        room,
        services: bookingWithServices?.services || [],
      });
    }

    res.json({ message: "Service removed" });
  } catch (error) {
    next(error);
  }
};
