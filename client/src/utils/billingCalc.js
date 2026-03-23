



export const calculateBillingSummary = ({ booking, bill, discountOverride, applyRounding = false } = {}) => {
  const roomRate = Number(booking?.room_id?.price?.per_night) || 0;
  const taxPercent = Number(booking?.room_id?.price?.tax_percent) || 0;
  const checkOutDate = booking?.check_out_date || booking?.expected_checkout || new Date();

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(booking?.check_in_date, checkOutDate);

  const rawServicesTotal = (booking?.services || []).reduce((acc, service) => {
    const qty = Number(service.quantity) || 1;
    const unitPrice = Number(service.unit_price ?? service.price) || 0;
    const totalPrice = Number(service.total_price);
    const lineTotal = Number.isFinite(totalPrice) ? totalPrice : unitPrice * qty;
    return acc + lineTotal;
  }, 0);

  const billTotal = Number(bill?.total_amount);
  const hasBillTotals = Number.isFinite(billTotal) && billTotal > 0;

  const roomCharge = hasBillTotals ? Number(bill?.room_charge) || 0 : roomRate * nights;
  const servicesTotal = hasBillTotals
    ? Number(bill?.services_charge) || 0
    : rawServicesTotal;

  const baseSubtotal = roomCharge + servicesTotal;
  const discountValue = discountOverride ?? bill?.discount?.amount;
  const manualDiscount = Math.max(0, Number(discountValue) || 0);
  const taxableAmount = Math.max(0, baseSubtotal - manualDiscount);
  const gstTotal = (taxableAmount * taxPercent) / 100;
  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;
  const totalBeforeRound = hasBillTotals ? Number(bill?.total_amount) || 0 : taxableAmount + gstTotal;
  const backendPayable = Number(bill?.payable_amount);
  const backendRoundoff = Number(bill?.roundoff_amount);
  const expectedRounded = Math.floor(totalBeforeRound / 10) * 10;
  const expectedRoundoff = expectedRounded - totalBeforeRound;
  const backendIsConsistent = Number.isFinite(backendPayable)
    && Number.isFinite(backendRoundoff)
    && Math.abs((Number(bill?.total_amount) || 0) + backendRoundoff - backendPayable) < 0.01;
  const backendIsValid = backendIsConsistent
    && Math.abs(backendPayable - expectedRounded) < 0.01
    && Math.abs(backendRoundoff - expectedRoundoff) < 0.01;
  const roundedTotal = applyRounding
    ? (backendIsValid ? backendPayable : expectedRounded)
    : totalBeforeRound;
  const roundOff = applyRounding
    ? (backendIsValid ? backendRoundoff : expectedRoundoff)
    : 0;

  const amountPaid = Number(bill?.amount_paid ?? booking?.advance_paid) || 0;
  const balanceDue = Math.max(0, roundedTotal - amountPaid);

  return {
    roomRate,
    taxPercent,
    nights,
    roomCharge,
    servicesTotal,
    baseSubtotal,
    manualDiscount,
    taxableAmount,
    gstTotal,
    cgst,
    sgst,
    totalBeforeRound,
    roundedTotal,
    roundOff,
    amountPaid,
    balanceDue,
    hasBillTotals,
  };
};
