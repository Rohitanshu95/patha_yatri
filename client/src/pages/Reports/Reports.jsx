import React, { useEffect, useState } from "react";
import { useReportStore } from "../../store/reportStore";

const Reports = () => {
  const { revenueData, gstData, occupancyData, isLoading, fetchReports } = useReportStore();
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ startDate: firstDay, endDate: lastDay });
  const [activeTab, setActiveTab] = useState("revenue"); // "revenue" | "occupancy" | "gst"

  useEffect(() => {
    fetchReports(dateRange.startDate, dateRange.endDate);
  }, [fetchReports, dateRange]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports(dateRange.startDate, dateRange.endDate);
  };

   const totalRev = revenueData?.totalRevenue || 0;
   const gstTotal = gstData?.summary?.totalGST || 0;
   const totalBookings = occupancyData?.totalBookings || 0;

   const revenueBreakdown = [
      { label: "Room", value: revenueData?.totalRoomCharges || 0 },
      { label: "Services", value: revenueData?.totalServices || 0 },
      { label: "Tax", value: revenueData?.totalTax || 0 }
   ];
   const revenueTotal = revenueBreakdown.reduce((acc, item) => acc + item.value, 0) || 1;
   const occupancyByStatus = occupancyData?.byStatus || [];
   const gstItems = gstData?.items || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-8 h-20 bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-[#D1C5B4]/15">
        <div>
           <h2 className="font-serif text-2xl text-[#222222] antialiased">Analytics & Reports</h2>
           <p className="text-[#777777] text-xs font-medium uppercase tracking-widest mt-0.5">Performance Overview</p>
        </div>
        <div className="flex items-center space-x-6">
           <form onSubmit={handleFilter} className="flex gap-4">
              <div className="flex gap-2 bg-[#F8F9FA] p-1 border border-[#D1C5B4]/30">
                 <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="bg-transparent border-none text-[10px] uppercase font-bold text-[#777777] outline-none px-2 cursor-pointer" />
                 <span className="text-[#777777] text-[10px] self-center">—</span>
                 <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="bg-transparent border-none text-[10px] uppercase font-bold text-[#777777] outline-none px-2 cursor-pointer" />
              </div>
              <button type="submit" disabled={isLoading} className="flex items-center space-x-2 bg-[#222222] text-white px-6 py-2.5 rounded-none font-medium text-xs tracking-widest uppercase hover:bg-[#C5A059] transition-all cursor-pointer disabled:opacity-50">
                <span>Update</span>
              </button>
           </form>
           <button className="flex items-center space-x-2 bg-white border border-[#D1C5B4] text-[#222222] px-6 py-2.5 rounded-none font-medium text-xs tracking-widest uppercase hover:bg-[#F8F9FA] transition-all cursor-pointer">
              <span className="material-symbols-outlined text-lg">download</span>
              <span>Export CSV</span>
           </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-10 space-y-10">
         {/* Top KPIs */}
         <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#D1C5B4]/15 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[#777777] text-[10px] font-bold uppercase tracking-[0.2em]">Net Revenue</p>
                   <span className="material-symbols-outlined text-[#C5A059] text-xl">account_balance_wallet</span>
                </div>
                <h3 className="font-serif text-4xl text-[#222222] mb-1">₹{totalRev.toLocaleString()}</h3>
                <p className="text-[#777777] text-xs font-medium tracking-wide">For selected period</p>
                <div className="mt-6 w-full bg-[#F8F9FA] h-px">
                   <div className="bg-[#C5A059] h-px w-[85%]"></div>
                </div>
            </div>
            
            <div className="bg-white border border-[#D1C5B4]/15 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[#777777] text-[10px] font-bold uppercase tracking-[0.2em]">Tax Collected (GST)</p>
                   <span className="material-symbols-outlined text-[#C5A059] text-xl">receipt_long</span>
                </div>
                <h3 className="font-serif text-4xl text-[#222222] mb-1">₹{gstTotal.toLocaleString()}</h3>
                <p className="text-[#777777] text-xs font-medium tracking-wide">Liability calculated</p>
                <div className="mt-6 w-full bg-[#F8F9FA] h-px">
                   <div className="bg-blue-300 h-px w-[40%]"></div>
                </div>
            </div>

            <div className="bg-white border border-[#D1C5B4]/15 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[#777777] text-[10px] font-bold uppercase tracking-[0.2em]">Occupancy Info</p>
                   <span className="material-symbols-outlined text-[#C5A059] text-xl">hotel</span>
                </div>
                <h3 className="font-serif text-4xl text-[#222222] mb-1">{totalBookings}</h3>
                <p className="text-[#777777] text-xs font-medium tracking-wide">Total Bookings in period</p>
                <div className="mt-6 w-full bg-[#F8F9FA] h-px">
                   <div className="bg-emerald-300 h-px w-[60%]"></div>
                </div>
            </div>
         </section>

         {/* Detailed Tab View */}
         <section className="bg-white border border-[#D1C5B4]/15 shadow-sm p-8">
            <div className="flex gap-8 border-b border-[#D1C5B4]/20 mb-8 pb-4">
                <button onClick={() => setActiveTab('revenue')} className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-4 -mb-4 transition-all ${activeTab === 'revenue' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#777777] border-transparent hover:text-[#222222]'}`}>
                   Revenue Breakdown
                </button>
                <button onClick={() => setActiveTab('gst')} className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-4 -mb-4 transition-all ${activeTab === 'gst' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#777777] border-transparent hover:text-[#222222]'}`}>
                   GST Ledger
                </button>
                <button onClick={() => setActiveTab('occupancy')} className={`text-[10px] font-bold uppercase tracking-[0.2em] pb-4 -mb-4 transition-all ${activeTab === 'occupancy' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#777777] border-transparent hover:text-[#222222]'}`}>
                   Room Occupancy
                </button>
            </div>

                  <div className="min-h-[300px]">
                     {activeTab === "revenue" && (
                        <div className="space-y-6">
                           {revenueBreakdown.map((item) => (
                              <div key={item.label} className="space-y-2">
                                 <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#777777]">
                                    <span>{item.label}</span>
                                    <span className="text-[#222222]">₹{item.value.toLocaleString()}</span>
                                 </div>
                                 <div className="w-full h-2 bg-[#F8F9FA]">
                                    <div className="h-2 bg-[#C5A059]" style={{ width: `${(item.value / revenueTotal) * 100}%` }}></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === "gst" && (
                        <div className="space-y-4">
                           <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#777777]">
                              <span>Total GST</span>
                              <span className="text-[#222222]">₹{gstTotal.toLocaleString()}</span>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border border-[#D1C5B4]/20 p-4">
                                 <p className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">CGST</p>
                                 <p className="text-2xl font-serif text-[#222222]">₹{(gstData?.summary?.totalCGST || 0).toLocaleString()}</p>
                              </div>
                              <div className="border border-[#D1C5B4]/20 p-4">
                                 <p className="text-[10px] uppercase tracking-widest text-[#777777] font-bold">SGST</p>
                                 <p className="text-2xl font-serif text-[#222222]">₹{(gstData?.summary?.totalSGST || 0).toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="mt-6">
                              <div className="text-[10px] uppercase tracking-widest font-bold text-[#777777] mb-3">Recent GST Entries</div>
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                    <thead>
                                       <tr className="text-[10px] uppercase tracking-widest text-[#777777] border-b border-[#D1C5B4]/20">
                                          <th className="py-3">Invoice</th>
                                          <th className="py-3">Tax</th>
                                          <th className="py-3">Total</th>
                                          <th className="py-3">Date</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {gstItems.slice(0, 6).map((item) => (
                                          <tr key={item._id} className="border-b border-[#D1C5B4]/10 text-sm text-[#222222]">
                                             <td className="py-3">{item.invoice_number}</td>
                                             <td className="py-3">₹{Number(item.tax_amount || 0).toLocaleString()}</td>
                                             <td className="py-3">₹{Number(item.total_amount || 0).toLocaleString()}</td>
                                             <td className="py-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                                          </tr>
                                       ))}
                                       {gstItems.length === 0 && (
                                          <tr>
                                             <td colSpan="4" className="py-8 text-center text-[#777777] text-sm">No GST entries available</td>
                                          </tr>
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === "occupancy" && (
                        <div className="space-y-6">
                           <div className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">Bookings by Status</div>
                           <div className="space-y-3">
                              {occupancyByStatus.map((item) => (
                                 <div key={item.status} className="flex items-center gap-4">
                                    <div className="w-24 text-[10px] uppercase tracking-widest font-bold text-[#777777]">{item.status}</div>
                                    <div className="flex-1 h-2 bg-[#F8F9FA]">
                                       <div className="h-2 bg-[#C5A059]" style={{ width: `${(item.count / (totalBookings || 1)) * 100}%` }}></div>
                                    </div>
                                    <div className="text-sm font-semibold text-[#222222]">{item.count}</div>
                                 </div>
                              ))}
                              {occupancyByStatus.length === 0 && (
                                 <div className="text-sm text-[#777777]">No occupancy data available</div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
         </section>
      </div>
    </div>
  );
};

export default Reports;
