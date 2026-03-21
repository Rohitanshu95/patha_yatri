import React, { useEffect, useState } from "react";
import { useBillStore } from "../../store/billStore";
import { useBookingStore } from "../../store/bookingStore";

const Billing = () => {
  const { bills, isLoading, fetchBills, generateBill, processPayment, downloadInvoice } = useBillStore();
  const { bookings, fetchBookings } = useBookingStore();
  
  const [view, setView] = useState("list"); // "list" | "invoice"
  const [activeBill, setActiveBill] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState("");

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

  const handlePayment = async (e) => {
    e.preventDefault();
    const res = await processPayment(activeBill._id, { 
       method: paymentMethod,
       amount: Number(paymentAmount) || activeBill.remaining_amount
    });
    if (res) {
      setPaymentAmount("");
      // Update the active bill so the view refreshes automatically!
      if (res.bill) setActiveBill(res.bill);
      fetchBills();
    }
  };

  const checkedInBookings = bookings?.filter(b => b.status === "checked-in") || [];

  // Derived stats for metrics (mocked partially mapped to real bills)
  const totalCollected = bills?.reduce((acc, b) => acc + (b.amount_paid || 0), 0) || 0;
  const pendingDue = bills?.reduce((acc, b) => acc + (b.remaining_amount || 0), 0) || 0;

  if (view === "invoice" && activeBill) {
     return (
        <div className="flex-1 min-h-screen bg-[#F8F9FA] pb-12">
            <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-[#D1C5B4]/15 flex justify-between items-center px-8 h-20">
                <div className="flex items-center gap-4">
                   <h2 className="font-serif text-2xl text-[#222222]">Billing Interface</h2>
                </div>
            </header>
            <div className="pt-10 px-8 max-w-7xl mx-auto space-y-12">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button onClick={() => { setView("list"); setActiveBill(null); }} className="flex items-center gap-2 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 hover:translate-x-[-4px] transition-transform cursor-pointer">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Transactions
                        </button>
                        <h2 className="text-3xl font-serif text-[#222222]">Billing — {activeBill.invoice_number}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => downloadInvoice(activeBill._id)} className="px-6 py-3 bg-[#C5A059] text-[10px] font-bold uppercase tracking-[0.15em] text-white hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer">
                           <span className="material-symbols-outlined text-lg">download</span>
                           Download PDF
                        </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
                    {/* LEFT COLUMN: INVOICE */}
                    <div className="lg:col-span-7 space-y-8">
                       <div className="bg-white border border-[#D1C5B4]/30 shadow-sm p-12">
                           <div className="flex justify-between items-start mb-16">
                               <div>
                                  <h3 className="text-2xl font-serif text-[#C5A059] mb-4 uppercase tracking-widest">Grand Elysium Hotel</h3>
                                  <p className="text-xs text-[#777777] max-w-xs leading-relaxed uppercase tracking-wider">
                                      123 Luxury Lane, Bhubaneswar, Odisha — 751001<br/>
                                      GSTIN: 21AAAAA0000A1Z5
                                  </p>
                               </div>
                               <div className="text-right">
                                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-bold block mb-2">Invoice Number</span>
                                  <p className="text-xl font-serif text-[#222222]">{activeBill.invoice_number}</p>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-12 mb-16 border-y border-[#D1C5B4]/20 py-10">
                               <div>
                                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold block mb-4">Guest Information</span>
                                  <p className="text-lg font-serif text-[#222222] mb-1">{activeBill.booking_id?.guest_id?.name || 'Guest'}</p>
                                  <p className="text-xs text-[#777777] uppercase tracking-wider">Room {activeBill.booking_id?.room_id?.room_number || 'N/A'}</p>
                               </div>
                               <div>
                                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold block mb-4">Stay Information</span>
                                  <p className="text-sm text-[#222222] font-medium mb-1">
                                      {activeBill.booking_id?.check_in_date ? new Date(activeBill.booking_id.check_in_date).toLocaleDateString() : 'N/A'} — <br/>
                                      {activeBill.booking_id?.check_out_date ? new Date(activeBill.booking_id.check_out_date).toLocaleDateString() : 'Active'}
                                  </p>
                               </div>
                           </div>

                           <div className="mb-12">
                              <table className="w-full text-left">
                                 <thead>
                                   <tr className="text-[10px] uppercase tracking-[0.2em] text-[#777777] border-b border-[#D1C5B4]/40">
                                      <th className="pb-4 font-bold">Description</th>
                                      <th className="pb-4 text-right font-bold">Amount</th>
                                   </tr>
                                 </thead>
                                 <tbody className="text-sm">
                                    <tr className="border-b border-[#F8F9FA]">
                                        <td className="py-6 text-[#222222] font-medium">Room Charges</td>
                                        <td className="py-6 text-right text-[#222222] font-semibold">₹{activeBill.room_charge?.toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-[#F8F9FA]">
                                        <td className="py-6 text-[#222222] font-medium">Services & Amenities</td>
                                        <td className="py-6 text-right text-[#222222] font-semibold">₹{activeBill.services_charge?.toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-[#F8F9FA]">
                                        <td className="py-6 text-[#222222] font-medium text-xs text-[#777777]">Tax Amount</td>
                                        <td className="py-6 text-right text-[#777777] font-semibold">₹{activeBill.tax_amount?.toLocaleString()}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                           
                           <div className="flex flex-col items-end gap-4 pt-10">
                              <div className="flex justify-between w-72">
                                  <span className="text-xs font-bold text-[#222222] uppercase tracking-[0.2em]">Total Due</span>
                                  <span className="text-2xl font-serif text-[#222222]">₹{activeBill.total_amount?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between w-72 text-xs text-[#777777] uppercase tracking-widest">
                                  <span>Amount Paid</span>
                                  <span className="font-bold">₹{activeBill.amount_paid?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex justify-between w-72 mt-4 bg-[#F8F9FA] p-4 border-l-4 border-[#C5A059]">
                                  <span className="text-[10px] font-bold text-[#777777] uppercase tracking-[0.2em]">Balance Due</span>
                                  <span className="text-xl font-serif text-[#C5A059]">₹{activeBill.remaining_amount?.toLocaleString() || 0}</span>
                              </div>
                           </div>
                       </div>
                    </div>

                    {/* RIGHT COLUMN: ACTIONS */}
                    <div className="lg:col-span-3 space-y-8">
                       <div className="bg-[#F8F9FA] border border-[#D1C5B4]/15 p-8">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-[10px] font-bold text-[#222222] uppercase tracking-[0.2em]">Payment Status</h4>
                              <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-white border ${
                                activeBill.status === 'paid' ? 'border-emerald-600 text-emerald-600' : 'border-[#C5A059] text-[#C5A059]'
                              }`}>
                                {activeBill.status}
                              </span>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#777777]">
                                  <span>Total Bill</span>
                                  <span className="text-[#222222] font-bold">₹{activeBill.total_amount?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#777777]">
                                  <span>Received</span>
                                  <span className="text-[#C5A059] font-bold">₹{activeBill.amount_paid?.toLocaleString() || 0}</span>
                              </div>
                              <div className="w-full bg-[#EDEEEF] h-1">
                                  <div className="bg-[#C5A059] h-full" style={{width: `${Math.min(((activeBill.amount_paid || 0) / activeBill.total_amount) * 100, 100) || 0}%`}}></div>
                              </div>
                           </div>
                       </div>

                       {activeBill.status !== 'paid' && (
                       <form onSubmit={handlePayment} className="bg-white border border-[#D1C5B4]/30 p-8">
                           <h4 className="text-[10px] font-bold text-[#222222] uppercase tracking-[0.2em] mb-8">Record Payment</h4>
                           <div className="flex gap-px bg-[#EDEEEF] border border-[#EDEEEF] mb-8">
                               {['Cash', 'Card', 'UPI'].map(method => (
                                 <button type="button" key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                                    paymentMethod === method ? 'bg-white text-[#C5A059]' : 'bg-[#F8F9FA] text-[#777777] hover:text-[#222222]'
                                 }`}>
                                    {method}
                                 </button>
                               ))}
                           </div>
                           <div className="space-y-6 mb-8">
                               <div>
                                  <label className="text-[9px] uppercase font-bold text-[#777777] tracking-[0.2em] block mb-2">Amount (₹)</label>
                                  <input 
                                     required 
                                     type="number" 
                                     value={paymentAmount} 
                                     onChange={(e) => setPaymentAmount(e.target.value)} 
                                     placeholder={activeBill.remaining_amount} 
                                     max={activeBill.remaining_amount}
                                     className="w-full bg-[#F8F9FA] border-b border-[#D1C5B4] focus:border-[#C5A059] focus:ring-0 text-lg font-serif text-[#222222] py-3 px-4 outline-none" 
                                  />
                               </div>
                           </div>
                           <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer">
                               {isLoading ? "Processing..." : "Submit Payment"}
                               {!isLoading && <span className="material-symbols-outlined text-base">arrow_forward</span>}
                           </button>
                       </form>
                       )}
                    </div>
                 </div>
            </div>
        </div>
     );
  }

  // LIST VIEW default
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
                        bills.map(bill => (
                           <tr key={bill._id} className="hover:bg-[#F8F9FA] transition-colors group cursor-pointer" onClick={() => {setActiveBill(bill); setView("invoice");}}>
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
                                  ₹{bill.total_amount?.toLocaleString() || 0}
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
                                     <button onClick={(e) => { e.stopPropagation(); downloadInvoice(bill._id); }} className="p-2 hover:bg-white text-[#777777] hover:text-[#C5A059] transition-all cursor-pointer" title="Download Receipt">
                                        <span className="material-symbols-outlined text-xl">download</span>
                                     </button>
                                     <button onClick={(e) => { e.stopPropagation(); setActiveBill(bill); setView("invoice"); }} className="p-2 hover:bg-white text-[#777777] hover:text-[#222222] transition-all cursor-pointer" title="View Details">
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
