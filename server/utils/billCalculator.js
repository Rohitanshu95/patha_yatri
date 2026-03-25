export const calculateBill = ({ roomPricePerNight, nights, services = [], discount = 0, taxPercent, surcharge = 0, applyRounding = false }) => {
  const roomTotal = (Number(roomPricePerNight) || 0) * (Number(nights) || 1);

  const servicesTotal = services.reduce((acc, curr) => {
    const quantity = Number(curr.quantity) || 1;
    const unitPrice = Number(curr.unit_price ?? curr.price) || 0;
    const totalPrice = Number(curr.total_price);
    const lineTotal = Number.isFinite(totalPrice) ? totalPrice : unitPrice * quantity;
    return acc + lineTotal;
  }, 0);

  const surchargeTotal = Number(surcharge) || 0;
  const subtotal = roomTotal + servicesTotal + surchargeTotal;
  
  // Tax logic
  const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
  
  const total = subtotal + taxAmount - (Number(discount) || 0);
  const safeTotal = Math.max(0, total) || 0;
  const roundedTotal = applyRounding ? Math.floor(safeTotal / 10) * 10 : safeTotal;
  const roundoffAmount = applyRounding ? roundedTotal - safeTotal : 0;
  
  return {
    roomTotal,
    servicesTotal,
    surchargeTotal,
    subtotal,
    taxAmount,
    discount,
    total: safeTotal,
    payableTotal: roundedTotal,
    roundoffAmount,
  };
};