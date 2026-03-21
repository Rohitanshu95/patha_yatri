export const calculateBill = ({ roomPricePerNight, nights, services = [], discount = 0, taxPercent }) => {
  const roomTotal = (Number(roomPricePerNight) || 0) * (Number(nights) || 1);
  
  const servicesTotal = services.reduce((acc, curr) => {
    return acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1));
  }, 0);

  const subtotal = roomTotal + servicesTotal;
  
  // Tax logic
  const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
  
  const total = subtotal + taxAmount - (Number(discount) || 0);
  
  return {
    roomTotal,
    servicesTotal,
    subtotal,
    taxAmount,
    discount,
    total: Math.max(0, total) || 0, // Fallback to 0 if NaN slips through
  };
};