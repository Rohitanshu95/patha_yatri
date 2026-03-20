import React, { useEffect } from 'react';
import LuxuryCard from '../../components/ui/LuxuryCard';
import { useReceptionistStore } from '../../store/receptionistStore';
import { format } from 'date-fns';

const ReceptionistDashboard = () => {
  const { dashboardData, isLoading, fetchDashboardData, checkInGuest, checkOutGuest } = useReceptionistStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return <div className="p-8 text-on-surface">Loading Dashboard...</div>;
  }

  const arrivalsCount = dashboardData?.pendingArrivals?.length || 0;
  const inHouseCount = dashboardData?.inHouse?.length || 0;
  const departuresCount = dashboardData?.todaysDepartures?.length || 0;
  const roomStatus = dashboardData?.roomStatus || { available: 0, occupied: 0, maintenance: 0, total: 0 };

  return (
    <>
      {/* Dashboard Header is handled by global header in AppLayout, but we can do an Operational Overview section */}
      <header className="mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-serif text-on-surface tracking-tight">Operational Overview</h2>
        </div>
      </header>

      {/* KPI Grid - Bento Style */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Arrivals Card */}
        <LuxuryCard className="group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container border border-outline/10">
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <span className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span> -
            </span>
          </div>
          <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Arrivals Today</h3>
          <p className="text-5xl font-serif text-on-surface">{arrivalsCount < 10 && arrivalsCount > 0 ? `0${arrivalsCount}` : arrivalsCount}</p>
        </LuxuryCard>

        {/* In-House Card */}
        <LuxuryCard className="group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container border border-outline/10">
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <span className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span> {(roomStatus.occupied / (roomStatus.total || 1) * 100).toFixed(0)}%
            </span>
          </div>
          <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Current Occupancy</h3>
          <p className="text-5xl font-serif text-on-surface">{inHouseCount < 10 && inHouseCount > 0 ? `0${inHouseCount}` : inHouseCount}</p>
        </LuxuryCard>

        {/* Departures Card */}
        <LuxuryCard className="group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container border border-outline/10">
              <span className="material-symbols-outlined text-primary">person_remove</span>
            </div>
            <span className="flex items-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-1">trending_down</span> -
            </span>
          </div>
          <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Departures Today</h3>
          <p className="text-5xl font-serif text-on-surface">{departuresCount < 10 && departuresCount > 0 ? `0${departuresCount}` : departuresCount}</p>
        </LuxuryCard>

        {/* Available Card */}
        <LuxuryCard className="group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-surface-container border border-outline/10">
              <span className="material-symbols-outlined text-primary">bed</span>
            </div>
            <span className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span> {(roomStatus.available / (roomStatus.total || 1) * 100).toFixed(0)}%
            </span>
          </div>
          <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Rooms Available</h3>
          <p className="text-5xl font-serif text-on-surface">{roomStatus.available < 10 && roomStatus.available > 0 ? `0${roomStatus.available}` : roomStatus.available}</p>
        </LuxuryCard>
      </section>

      {/* Operational Tables Section */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-12">
        {/* Pending Arrivals */}
        <div className="bg-surface border border-outline/15 shadow-[0_20px_40px_rgba(34,34,34,0.06)] overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-outline/15 bg-surface-container">
            <h3 className="text-xl font-serif text-on-surface tracking-wide">Pending Arrivals</h3>
            <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">View All Details</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">Guest Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">Suite</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">ETA</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10 text-right">Concierge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 bg-surface">
                {dashboardData?.pendingArrivals && dashboardData.pendingArrivals.length > 0 ? (
                  dashboardData.pendingArrivals.slice(0, 5).map((arrival) => (
                    <tr key={arrival._id} className="hover:bg-surface-container transition-colors group">
                      <td className="px-8 py-5 font-medium text-on-surface">{arrival.guest_id?.name || 'Unknown'}</td>
                      <td className="px-8 py-5 text-on-surface-variant">{arrival.room_id?.room_number || 'TBD'} ({arrival.room_id?.room_category || 'N/A'})</td>
                      <td className="px-8 py-5 text-on-surface-variant">{arrival.check_in_date ? format(new Date(arrival.check_in_date), 'HH:mm aaa') : '-'}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => checkInGuest(arrival._id)}
                          className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 transition-all hover:bg-on-surface active:opacity-80 flex items-center gap-2 ml-auto">
                          Check-In <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-5 text-center text-on-surface-variant text-[12px] font-medium">No pending arrivals</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Departures */}
        <div className="bg-surface border border-outline/15 shadow-[0_20px_40px_rgba(34,34,34,0.06)] overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-outline/15 bg-surface-container">
            <h3 className="text-xl font-serif text-on-surface tracking-wide">Today's Departures</h3>
            <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">Full Roster</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">Guest Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">Room</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 bg-surface">
                {dashboardData?.todaysDepartures && dashboardData.todaysDepartures.length > 0 ? (
                  dashboardData.todaysDepartures.slice(0, 5).map((departure) => (
                    <tr key={departure._id} className="hover:bg-surface-container transition-colors group">
                      <td className="px-8 py-5 font-medium text-on-surface">{departure.guest_id?.name || 'Unknown'}</td>
                      <td className="px-8 py-5 text-on-surface-variant">{departure.room_id?.room_number || 'TBD'}</td>
                      <td className="px-8 py-5">
                        <span className="border border-outline text-on-surface-variant text-[9px] font-bold px-3 py-1 uppercase tracking-widest">{departure.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => checkOutGuest(departure._id)}
                          className="border border-primary text-primary hover:bg-gold-gradient hover:text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 transition-all active:scale-95 flex items-center gap-2 ml-auto">
                          Check-Out <span className="material-symbols-outlined text-sm">logout</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-5 text-center text-on-surface-variant text-[12px] font-medium">No departures today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Room Availability Visualization */}
      <section className="bg-surface border border-outline/15 p-10 shadow-[0_20px_40px_rgba(34,34,34,0.06)] mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h3 className="text-2xl font-serif text-on-surface tracking-wide">Real-time Suite Inventory</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-on-surface"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Occupied ({roomStatus.occupied})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Available ({roomStatus.available})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-outline"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">In Service ({roomStatus.maintenance})</span>
            </div>
          </div>
        </div>

        {/* Custom Horizontal Bar Chart */}
        <div className="relative w-full h-10 bg-surface-container border border-outline/10 overflow-hidden flex">
          {/* Occupied */}
          <div className="h-full bg-on-surface relative group transition-all duration-700 cursor-pointer" style={{ width: `${(roomStatus.occupied / (roomStatus.total || 1)) * 100}%` }}>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
              {((roomStatus.occupied / (roomStatus.total || 1)) * 100).toFixed(0)}% Occupancy
            </span>
          </div>
          {/* Available */}
          <div className="h-full bg-primary relative group transition-all duration-700 cursor-pointer border-x border-white/10" style={{ width: `${(roomStatus.available / (roomStatus.total || 1)) * 100}%` }}>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
              {((roomStatus.available / (roomStatus.total || 1)) * 100).toFixed(0)}% Available
            </span>
          </div>
          {/* Maintenance */}
          <div className="h-full bg-outline relative group transition-all duration-700 cursor-pointer" style={{ width: `${(roomStatus.maintenance / (roomStatus.total || 1)) * 100}%` }}>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-on-surface opacity-0 group-hover:opacity-100 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
              {((roomStatus.maintenance / (roomStatus.total || 1)) * 100).toFixed(0)}% Maintenance
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em]">
          <span>Total Asset Count: {roomStatus.total} Suites</span>
          <span className="text-primary font-bold">Synchronized</span>
        </div>
      </section>

      {/* Contextual FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-gold-gradient text-white shadow-2xl flex items-center justify-center hover:opacity-90 transition-all z-50 rounded-none">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
};

export default ReceptionistDashboard;