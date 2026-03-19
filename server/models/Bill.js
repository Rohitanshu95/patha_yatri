const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  room_charge: { type: Number, required: true },
  services_charge: { type: Number, required: true },
  tax_amount: { type: Number, required: true },
  discount: {
    type: { type: String, enum: ['seasonal', 'loyalty', 'corporate', 'manual'] },
    amount: { type: Number }
  },
  total_amount: { type: Number, required: true },
  amount_paid: { type: Number, required: true },
  remaining_amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid', 'partial'], required: true },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  invoice_number: { type: String, required: true, unique: true },
  finalized_at: { type: Date }
}, { timestamps: true });

billSchema.index({ booking_id: 1 });
billSchema.index({ status: 1 });
billSchema.index({ createdAt: 1 });
billSchema.index({ invoice_number: 1 });

module.exports = mongoose.model('Bill', billSchema);
