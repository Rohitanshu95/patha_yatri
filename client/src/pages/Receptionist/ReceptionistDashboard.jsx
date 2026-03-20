import React, { useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  DoorOpen 
} from 'lucide-react';
import { useReceptionistStore } from '../../store/receptionistStore';

const KPICard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const ReceptionistDashboard = () => {
  const { dashboardData, isLoading, fetchDashboardData, checkInGuest, checkOutGuest } = useReceptionistStore();

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleCheckIn = async (id) => {
    if (window.confirm("Are you sure you want to check-in this guest?")) {
      await checkInGuest(id);
    }
  };

  const handleCheckOut = async (id) => {
    if (window.confirm("Are you sure you want to check-out this guest?")) {
      await checkOutGuest(id);
    }
  };

  if (isLoading && !dashboardData.pendingArrivals.length && !dashboardData.inHouse.length) {
    return <div className="flex h-full items-center justify-center p-6 text-gray-500">Loading Dashboard...</div>;
  }

  const { pendingArrivals, todaysDepartures, inHouse, roomStatus } = dashboardData;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Receptionist Dashboard</h1>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Arrivals Pending" 
          value={pendingArrivals?.length || 0} 
          icon={UserCheck}
          colorClass="bg-blue-100 text-blue-600"
        />
        <KPICard 
          title="Departures Today" 
          value={todaysDepartures?.length || 0} 
          icon={UserMinus}
          colorClass="bg-orange-100 text-orange-600"
        />
        <KPICard 
          title="In-House Guests" 
          value={inHouse?.length || 0} 
          icon={Users}
          colorClass="bg-green-100 text-green-600"
        />
        <KPICard 
          title="Rooms Available" 
          value={roomStatus?.available || 0} 
          icon={DoorOpen}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Arrivals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Pending Arrivals</h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{pendingArrivals?.length || 0}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(pendingArrivals?.length === 0) ? (
                  <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-500">No arrivals pending</td></tr>
                ) : (
                  pendingArrivals?.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{booking.guest_id?.name || 'Unknown Guest'}</div>
                        <div className="text-xs text-gray-500">{booking.guest_id?.contact}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {booking.room_id?.room_number || 'N/A'} 
                        <span className="text-xs ml-1 text-gray-400 capitalize">({booking.room_id?.room_category})</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleCheckIn(booking._id)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition shadow-sm text-xs cursor-pointer"
                        >
                          Check-In
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Departures */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Today's Departures</h2>
            <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{todaysDepartures?.length || 0}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(todaysDepartures?.length === 0) ? (
                  <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-500">No departures today</td></tr>
                ) : (
                  todaysDepartures?.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{booking.guest_id?.name || 'Unknown Guest'}</div>
                        <div className="text-xs text-gray-500">{booking.guest_id?.contact}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {booking.room_id?.room_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleCheckOut(booking._id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition shadow-sm text-xs cursor-pointer"
                        >
                          Check-Out
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Room Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Room Availability</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 overflow-hidden flex">
               <div className="bg-purple-600 h-2.5" style={{ width: `${roomStatus?.total ? (roomStatus?.occupied / roomStatus?.total) * 100 : 0}%` }}></div>
               <div className="bg-green-500 h-2.5" style={{ width: `${roomStatus?.total ? (roomStatus?.available / roomStatus?.total) * 100 : 0}%` }}></div>
               <div className="bg-yellow-500 h-2.5" style={{ width: `${roomStatus?.total ? (roomStatus?.maintenance / roomStatus?.total) * 100 : 0}%` }}></div>
            </div>
         </div>
         <div className="flex gap-4 sm:ml-8 text-sm mt-3 sm:mt-0 font-medium text-gray-600 flex-wrap">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-600"></div> Occupied ({roomStatus?.occupied || 0})</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available ({roomStatus?.available || 0})</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Maintenance ({roomStatus?.maintenance || 0})</div>
         </div>
      </div>

    </div>
  );
};

export default ReceptionistDashboard;