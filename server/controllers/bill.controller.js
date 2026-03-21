import Bill from "../models/Bill.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { calculateBill } from "../utils/billCalculator.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import PDFDocument from "pdfkit";

export const getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: "booking_id",
        populate: [
          { path: "guest_id" },
          { path: "room_id" }
        ]
      })
      .sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    next(error);
  }
};

export const generateBill = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

    const booking = await Booking.findById(bookingId).populate("services");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const room = await Room.findById(booking.room_id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    let bill = await Bill.findOne({ booking_id: bookingId });
    if (!bill) {
      return res.status(404).json({ message: "Bill not found for this booking" });
    }

    // Calculate nights based on check_out_date if checked out, or current date, or fallback to 1
    const endDate = booking.check_out_date || new Date();
    const nights = Math.max(1, Math.ceil((new Date(endDate) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24)));

    console.log("BILL_CALC_INPUTS:", {
      roomPricePerNight: room?.price?.per_night,
      nights,
      servicesLength: booking.services?.length,
      discount: bill.discount || 0,
      taxPercent: room?.price?.tax_percent,
      checkIn: booking.check_in_date,
      endDate
    });

    const calc = calculateBill({
      roomPricePerNight: Number(room?.price?.per_night) || 0,
      nights: Number(nights) || 1,
      services: booking.services || [],
      discount: Number(bill.discount) || 0,
      taxPercent: Number(room?.price?.tax_percent) || 0,
    });

    console.log("BILL_CALC_RESULT:", calc);

    bill.room_charge = Number(calc.roomTotal) || 0;
    bill.services_charge = Number(calc.servicesTotal) || 0;
    bill.tax_amount = Number(calc.taxAmount) || 0;
    bill.total_amount = Number(calc.total) || 0;
    bill.remaining_amount = bill.total_amount - (Number(bill.amount_paid) || 0);
    if (bill.amount_paid >= bill.total_amount && bill.total_amount > 0) {
      bill.status = "paid";
    } else if (bill.amount_paid > 0) {
      bill.status = "partial";
    } else {
      bill.status = "unpaid";
    }

    await bill.save();

    res.json(bill);
  } catch (error) {
    next(error);
  }
};

// Generate PDF
export const getInvoicePDF = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("guest_id")
      .populate("room_id");
      
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${bill.invoice_number || 'draft'}.pdf`);
    doc.pipe(res);
    
    doc.fontSize(20).text('Patha Yatri Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice No: ${bill.invoice_number || 'N/A'}`);
    doc.text(`Guest: ${bill.guest_id.first_name} ${bill.guest_id.last_name}`);
    doc.text(`Room: ${bill.room_id.room_number}`);
    doc.moveDown();
    
    doc.text(`Room Charges: ₹${bill.room_charges}`);
    doc.text(`Services Total: ₹${bill.services_total}`);
    doc.text(`Discount: ₹${bill.discount}`);
    doc.text(`Tax: ₹${bill.tax_amount}`);
    doc.moveDown();
    
    doc.fontSize(14).text(`Total Amount: ₹${bill.total_amount}`, { underline: true });
    doc.text(`Amount Paid: ₹${bill.amount_paid}`);
    
    doc.end();

  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ booking_id: req.params.bookingId });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const applyDiscount = async (req, res, next) => {
  try {
    const { discount } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.discount = Number(discount);
    await bill.save();

    res.json(bill);
  } catch (error) {
    next(error);
  }
};