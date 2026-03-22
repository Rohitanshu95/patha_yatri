import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBillStore } from "../../store/billStore";
import { useBookingStore } from "../../store/bookingStore";

const Billing = () => {
   const { bills, isLoading, fetchBills, generateBill, downloadInvoice } = useBillStore();
  const { bookings, fetchBookings } = useBookingStore();
   const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");

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
      fetchBills(); // refresh to get populated details correctly
    }
  };


  const checkedInBookings = bookings?.filter(b => b.status === "checked-in") || [];

  // Derived stats for metrics (mocked partially mapped to real bills)
  const totalCollected = bills?.reduce((acc, b) => acc + (b.amount_paid || 0), 0) || 0;
  const pendingDue = bills?.reduce((acc, b) => acc + (b.remaining_amount || 0), 0) || 0;

  // LIST VIEW
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F9FA]">
      <header className="flex justify-between items-center w-full px-8 h-20 bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-[#D1C5B4]/15">
        <div>
           <h2 className="font-serif text-2xl text-[#222222] antialiased">Payment Gateway & Transactions</h2>
           <p className="text-[#777777] text-xs font-medium uppercase tracking-widest mt-0.5">Real-time revenue monitoring</p>
        </div>
        <div className="flex items-center space-x-6">
           <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-[#222222] text-white px-6 py-2.5 rounded-none font-medium text-xs tracking-widest uppercase hover:bg-[#C5A059] transition-all cursor-pointer">
             <span className="material-symbols-outlined text-lg">add</span>
             <span>Generate Bill</span>
           </button>
        </div>
      </header>
      
      <div className="p-10 space-y-10">
         <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#D1C5B4]/15 p-8 rounded-none shadow-sm">
                <p className="text-[#777777] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Collected</p>
                <h3 className="font-serif text-4xl text-[#222222]">₹{totalCollected.toLocaleString()}</h3>
                <div className="mt-6 w-full bg-[#F8F9FA] h-px">
                   <div className="bg-[#C5A059] h-px w-[75%]"></div>
                </div>
            </div>
            <div className="bg-white border border-[#D1C5B4]/15 p-8 rounded-none shadow-sm">
                <p className="text-[#777777] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Pending Due</p>
                <h3 className="font-serif text-4xl text-[#222222]">₹{pendingDue.toLocaleString()}</h3>
                <div className="mt-6 w-full bg-[#F8F9FA] h-px">
                   <div className="bg-orange-300 h-px w-[30%]"></div>
                </div>
            </div>
         </section>

         <section className="bg-white rounded-none overflow-hidden shadow-sm border border-[#D1C5B4]/15">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#F8F9FA] border-b border-[#D1C5B4]/15">
                         <th className="px-8 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em]">Transaction / Bill</th>
                         <th className="px-6 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em]">Date</th>
                         <th className="px-6 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em]">Guest Ref</th>
                         <th className="px-6 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em]">Amount</th>
                         <th className="px-6 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                         <th className="px-8 py-5 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em] text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1C5B4]/10">
                     {isLoading ? (
                        <tr><td colSpan="6" className="px-8 py-6 text-center text-[#777777] text-sm">Loading bills...</td></tr>
                     ) : !bills || bills.length === 0 ? (
                        <tr><td colSpan="6" className="px-8 py-6 text-center text-[#777777] text-sm">No transactions found.</td></tr>
                     ) : (
                        bills.map((bill) => (
                           <tr
                             key={bill._id}
                             className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                             onClick={() => navigate(`/app/receptionist/billing/${bill.booking_id?._id || bill.booking_id}`)}
                           >
                               <td className="px-8 py-6">
                                  <span className="font-sans font-bold text-[#C5A059] tracking-tight">{bill.invoice_number}</span>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex flex-col">
                                     <span className="text-[#222222] font-medium text-sm">{new Date(bill.createdAt).toLocaleDateString()}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex flex-col">
                                     <span className="text-[#222222] font-semibold text-sm">{bill.booking_id?.guest_id?.name || 'Guest'}</span>
                                     <span className="text-[#777777] text-xs">Room {bill.booking_id?.room_id?.room_number}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-6 font-serif font-bold text-[#222222] text-lg">
                                  ₹{bill.payable_amount?.toLocaleString() || 0}
                               </td>
                               <td className="px-6 py-6">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-widest border ${
                                     bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                  }`}>
                                     {bill.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                       <button
                                                          onClick={(e) => { e.stopPropagation(); downloadInvoice(bill._id); }}
                                                          className="p-2 hover:bg-white text-[#777777] hover:text-[#C5A059] transition-all cursor-pointer"
                                                          title="Download Receipt"
                                                       >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                     </button>
                                                       <button
                                                          onClick={(e) => {
                                                             e.stopPropagation();
                                                             navigate(`/app/receptionist/billing/${bill.booking_id?._id || bill.booking_id}`);
                                                          }}
                                                          className="p-2 hover:bg-white text-[#777777] hover:text-[#222222] transition-all cursor-pointer"
                                                          title="View Details"
                                                       >
                                        <span className="material-symbols-outlined text-xl">visibility</span>
                                     </button>
                                  </div>
                               </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </section>
      </div>

      {/* Generate Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-2xl p-8 border border-[#D1C5B4]/30">
            <h3 className="text-xl font-serif text-[#222222] mb-6 border-b border-[#D1C5B4]/20 pb-4">Generate Bill</h3>
            <form onSubmit={handleGenerateBill} className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777] block mb-2">Select Active Booking</label>
                  <div className="relative">
                     <select required value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)} className="w-full appearance-none bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] transition-all cursor-pointer">
                        <option value="">Choose Booking</option>
                        {checkedInBookings.map(b => (
                           <option key={b._id} value={b._id}>Room {b.room_id?.room_number} - {b.guest_id?.name}</option>
                        ))}
                     </select>
                     <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none">expand_more</span>
                  </div>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#D1C5B4] text-[#222222] font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[#EDEEEF] transition-colors cursor-pointer">
                     Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#222222] text-white font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[#C5A059] transition-colors disabled:opacity-50 cursor-pointer">
                     {isLoading ? "Generating..." : "Create Invoice"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
