import Bill from "../models/Bill.js";

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  // Find the most recent bill to increment
  const lastBill = await Bill.findOne().sort({ createdAt: -1 });

  let sequence = 1;
  if (lastBill && lastBill.invoice_number) {
    const parts = lastBill.invoice_number.split("-");
    if (parts.length === 3 && parts[1] === year.toString()) {
      sequence = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedSequence = sequence.toString().padStart(4, "0");
  return `PY-${year}-${paddedSequence}`;
};