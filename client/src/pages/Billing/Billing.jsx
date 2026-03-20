import React, { useEffect, useState } from "react";
import { useBillStore } from "../../store/billStore";
import { useBookingStore } from "../../store/bookingStore";

const Billing = () => {
  const { bills, isLoading, fetchBills, generateBill, processPayment, downloadInvoice } = useBillStore();
  const { bookings, fetchBookings } = useBookingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    fetchBills();
    fetchBookings();
  }, [fetchBills, fetchBookings]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    const res = await generateBill(selectedBooking);
    if (res) {
      setIsModalOpen(false);
      setSelectedBooking("");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const res = await processPayment(selectedBill._id, { method: paymentMethod });
    if (res) {
      setIsPaymentOpen(false);
      setSelectedBill(null);
    }
  };

  const checkedInBookings = bookings?.filter(b => b.status === "CheckedIn") || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Billing & Payments</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Generate Bill
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-4">Invoice No</th>
              <th className="p-4">Guest</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(bills || []).length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center">No bills found.</td></tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{bill.invoiceNumber}</td>
                  <td className="p-4">{bill.booking?.guest?.firstName || 'Guest'}</td>
                  <td className="p-4">₹{bill.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {bill.paymentStatus === 'Unpaid' && (
                      <button onClick={() => { setSelectedBill(bill); setIsPaymentOpen(true); }} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Pay
                      </button>
                    )}
                    <button onClick={() => downloadInvoice(bill._id)} className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative p-8 bg-white w-full max-w-md m-auto rounded-xl shadow-lg">
             <h2 className="text-xl font-bold mb-6">Generate Bill for Checkout</h2>
             <form onSubmit={handleGenerateBill} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Booking</label>
                 <select required value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)} className="w-full border rounded-lg p-2">
                   <option value="">Choose Booking</option>
                   {checkedInBookings.map(b => (
                     <option key={b._id} value={b._id}>Room {b.room?.number} - {b.guest?.firstName}</option>
                   ))}
                 </select>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {isPaymentOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative p-8 bg-white w-full max-w-md m-auto rounded-xl shadow-lg">
             <h2 className="text-xl font-bold mb-6">Process Payment</h2>
             <form onSubmit={handlePayment} className="space-y-4">
               <p className="font-semibold text-lg">Amount Due: ₹{selectedBill.totalAmount}</p>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                 <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded-lg p-2">
                   <option value="Cash">Cash</option>
                   <option value="Card">Card</option>
                   <option value="UPI">UPI</option>
                 </select>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirm Payment</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;