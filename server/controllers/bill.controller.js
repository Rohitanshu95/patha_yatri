import Bill from "../models/Bill.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import PDFDocument from "pdfkit";

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