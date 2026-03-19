const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  amount_paid: { type: Number, required: true },
  payment_method: { type: String, enum: ['cash', 'card', 'UPI'], required: true },
  
  status: { type: String, enum: ['success', 'failed', 'refunded'], default: 'success' },
  transaction_id: { type: String }, // Provided by payment gateway / POS
  
  remarks: { type: String } // e.g., 'Advance at check-in', 'Final settlement'
}, { timestamps: true });

module.exports = mongoose.model('BillPayment', billPaymentSchema);
