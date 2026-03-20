import React, { useEffect, useState } from "react";
import { useReportStore } from "../../store/reportStore";

const Reports = () => {
  const { revenueData, gstData, occupancyData, isLoading, fetchReports } = useReportStore();
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({ startDate: firstDay, endDate: lastDay });

  useEffect(() => {
    fetchReports(dateRange.startDate, dateRange.endDate);
  }, [fetchReports, dateRange]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports(dateRange.startDate, dateRange.endDate);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial & Occupancy Reports</h1>
        
        <form onSubmit={handleFilter} className="flex gap-4">
          <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="border rounded p-2" />
          <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="border rounded p-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        </form>
      </div>

      {isLoading ? (
        <p>Loading reports...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-800">
              ₹{revenueData?.[0]?.totalNetRevenue || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Total GST Collected</h3>
            <p className="text-3xl font-bold text-gray-800">
              ₹{gstData?.[0]?.totalCGST + gstData?.[0]?.totalSGST || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Occupancy Info</h3>
            <p className="text-3xl font-bold text-gray-800">
              {occupancyData?.[0]?.totalBookings || 0} Bookings
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;