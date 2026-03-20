export const calculateBill = ({ roomPricePerNight, nights, services = [], discount = 0, taxPercent }) => {
  const roomTotal = roomPricePerNight * nights;
  
  const servicesTotal = services.reduce((acc, curr) => {
    return acc + (curr.price * curr.quantity);
  }, 0);

  const subtotal = roomTotal + servicesTotal;
  
  // Tax logic
  const taxAmount = (subtotal * taxPercent) / 100;
  
  const total = subtotal + taxAmount - discount;
  
  return {
    roomTotal,
    servicesTotal,
    subtotal,
    taxAmount,
    discount,
    total: Math.max(0, total),
  };
};