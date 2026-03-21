import React, { useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

const AdminDashboard = () => {
  const { dashboardData, isLoading, error, fetchDashboardData } = useAdminStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-xl font-serif text-primary animate-pulse tracking-widest uppercase">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface text-error border-t-2 border-error/50">
        <div className="text-center p-12 max-w-lg border border-outline/30 shadow-[0_10px_30px_-15px_rgba(34,34,34,0.1)]">
          <h2 className="text-2xl font-serif mb-4 text-on-surface">Data Unavailable</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-surface transition-colors uppercase tracking-widest text-xs font-bold">Retry Connection</button>
        </div>
      </div>
    );
  }

  // Use destructuring with defaults for extra safety
  const {
    totalRevenueToday = 0,
    revenueTrendPercent = 0,
    totalBookings = 0,
    occupancyRate = 0,
    activeStaff = { active: 0, total: 0 },
    revenueTrend = [],
    categoryOccupancy = [],
    recentActivity = [],
    staffStatus = []
  } = dashboardData || {};

  const data = {
    totalRevenueToday,
    revenueTrendPercent,
    totalBookings,
    occupancyRate,
    activeStaff,
    revenueTrend,
    categoryOccupancy,
    recentActivity,
    staffStatus
  };

  return (
    <div className="pb-16 px-10 space-y-10 luxury-gradient pt-8">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-surface border border-outline/30 p-8 hover:border-primary transition-all duration-300 shadow-[0_10px_30px_-15px_rgba(197,160,89,0.1)] group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Total Revenue Today</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 ${(revenueTrendPercent || 0) >= 0 ? 'text-green-700 bg-green-50' : 'text-error bg-red-50'}`}>
                  {(revenueTrendPercent || 0) >= 0 ? '+' : ''}{(revenueTrendPercent || 0)}%
                </span>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-serif text-on-surface">₹{(totalRevenueToday || 0).toLocaleString('en-IN')}</h3>
                <div className="text-primary"><span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">payments</span></div>
              </div>
            </div>

            <div className="bg-surface border border-outline/30 p-8 hover:border-primary transition-all duration-300 shadow-[0_10px_30px_-15px_rgba(197,160,89,0.1)] group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Total Bookings</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-serif text-on-surface">{totalBookings || 0}</h3>
                <div className="text-primary"><span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">bar_chart</span></div>
              </div>
            </div>

            <div className="bg-surface border border-outline/30 p-8 hover:border-primary transition-all duration-300 shadow-[0_10px_30px_-15px_rgba(197,160,89,0.1)] group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Occupancy Rate</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-serif text-on-surface">{occupancyRate || 0}%</h3>
                <div className="text-primary"><span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">donut_large</span></div>
              </div>
            </div>

            <div className="bg-surface border border-outline/30 p-8 hover:border-primary transition-all duration-300 shadow-[0_10px_30px_-15px_rgba(197,160,89,0.1)] group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Active Staff</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-serif text-on-surface">{activeStaff?.active || 0} <span className="text-lg text-on-surface-variant font-sans font-light">/ {activeStaff?.total || 0}</span></h3>
                <div className="text-primary"><span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">group</span></div>
              </div>
            </div>
          </div>

          {/* Second Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Revenue Trend */}
            <div className="lg:col-span-2 bg-surface p-10 border border-outline/20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-serif text-on-surface mb-1">Revenue Trend</h3>
                  <p className="text-sm text-on-surface-variant">Activity over the last 7 days</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Room Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-on-surface"></span>
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Service Revenue</span>
                  </div>
                </div>
              </div>

              {/* Chart Visualization mapping trend data to heights */}
              <div className="h-64 flex items-end justify-between relative mt-8">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-l border-outline/50 pl-2">
                  <div className="w-full border-t border-dashed border-outline/60 h-0 block"></div>
                  <div className="w-full border-t border-dashed border-outline/60 h-0 block"></div>
                  <div className="w-full border-t border-dashed border-outline/60 h-0 block"></div>
                  <div className="w-full border-t border-dashed border-outline/60 h-0 block"></div>
                </div>
                
                <div className="relative w-full h-full flex items-end justify-between px-6 gap-6 pb-0 z-10 pt-4">
                    {(revenueTrend || []).map((t, idx) => {
                       // Find max to scale
                       const max = Math.max(...(revenueTrend || []).map(d => d.total || 0), 1);
                       const roomH = ((t.roomRevenue || 0) / max) * 100;
                       const servH = ((t.serviceRevenue || 0) / max) * 100;
                       return (
                         <div key={idx} className="w-full flex flex-col justify-end group relative cursor-pointer h-full">
                           <div className="w-full bg-on-surface/90 transition-all hover:bg-on-surface duration-300" style={{ height: `${servH}%` }}></div>
                           <div className="w-full bg-primary transition-all hover:bg-primary-container duration-300 shadow-[0_-2px_4px_rgba(197,160,89,0.3)]" style={{ height: `${roomH}%` }}></div>
                           
                           {/* Tooltip */}
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface text-on-surface text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-outline/50 shadow-lg font-semibold tracking-wide">
                             ₹{(t.total || 0).toLocaleString('en-IN')}
                           </div>
                         </div>
                       )
                    })}
                </div>
              </div>
              
              <div className="flex justify-between mt-6 px-6 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">
                {(revenueTrend || []).map((t, idx) => <span key={idx} className="w-full text-center block">{t.day}</span>)}
              </div>
            </div>

            {/* Right: Occupancy Bar Chart */}
            <div className="bg-surface p-10 border border-outline/20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                  <h3 className="text-2xl font-serif text-on-surface mb-8">Occupancy</h3>
                  <div className="space-y-8">
                    {(categoryOccupancy || []).map((cat, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex justify-between text-xs tracking-widest uppercase font-semibold">
                          <span className="text-on-surface-variant">{cat.category}</span>
                          <span className="text-on-surface font-bold">{cat.rate || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container overflow-hidden rounded-r-full">
                          <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(197,160,89,0.8)]" style={{ width: `${cat.rate || 0}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {(categoryOccupancy || []).length === 0 && (
                      <div className="text-sm text-on-surface-variant italic font-serif opacity-60">No occupancy insights generated...</div>
                    )}
                  </div>
              </div>
              
              <div className="mt-16 p-6 bg-surface-container border-l-2 border-primary group hover:bg-surface-low transition-colors duration-500 cursor-default">
                <p className="text-xs text-on-surface-variant leading-loose italic font-serif flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary/60 mt-0.5">hotel_class</span>
                  "The hallmark of excellence is attention to the smallest details of guest satisfaction."
                </p>
              </div>
            </div>
          </div>

          {/* Third Row: Audit & User Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-surface-container p-10 border border-outline/20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif text-on-surface">Recent Activity</h3>
                <button className="text-primary text-[10px] font-bold tracking-[0.15em] uppercase hover:underline underline-offset-4 decoration-primary/50 transition-all">View All</button>
              </div>
              <div className="space-y-8">
                {(recentActivity || []).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-5 group">
                     <div className="w-10 h-10 border border-outline/30 flex items-center justify-center text-[10px] font-bold text-primary bg-surface shrink-0 group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                        {log.performedBy?.name ? log.performedBy.name.substring(0, 2).toUpperCase() : 'SYS'}
                     </div>
                     <div className="flex-1">
                        <p className="text-sm text-on-surface border-b border-transparent pb-1">
                          <span className="font-bold text-on-surface">{log.performedBy?.name || 'System'}</span> <span className="text-on-surface-variant">{log.action?.toLowerCase()}</span> <span className="text-primary font-semibold">{log.entity}</span>
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mt-1 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[12px]">schedule</span>
                           {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} <span className="text-outline/40">•</span> {log.performedBy?.role || 'System'}
                        </p>
                     </div>
                     <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined">more_vert</span></button>
                  </div>
                ))}
                {(recentActivity || []).length === 0 && (
                  <div className="text-sm text-on-surface-variant px-4 py-12 text-center border border-dashed border-outline/30 font-serif italic tracking-wide">Secure audit logs empty</div>
                )}
              </div>
            </div>

            {/* Staff Status Table */}
            <div className="bg-surface p-10 border border-outline/20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif text-on-surface">Staff Status</h3>
                <button className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant flex items-center gap-2 hover:text-primary transition-colors">
                  View All Users
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/20">
                      <th className="pb-4 font-bold pl-2">Name</th>
                      <th className="pb-4 font-bold">Role</th>
                      <th className="pb-4 font-bold text-center">Status</th>
                      <th className="pb-4 font-bold text-right pr-2">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10">
                    {(staffStatus || []).map((staff, idx) => (
                      <tr key={idx} className="group hover:bg-surface-low transition-colors duration-300">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 border border-outline/30 flex items-center justify-center text-[10px] font-bold text-primary bg-surface group-hover:border-primary/30 transition-colors">
                              {(staff.name || '??').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-on-surface tracking-wide">{staff.name || 'Unknown User'}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`text-[9px] font-bold tracking-widest px-3 py-1 border uppercase inline-block
                              ${staff.role === 'admin' ? 'bg-primary/5 text-primary border-primary/20' : 
                                staff.role === 'manager' ? 'bg-on-surface/5 text-on-surface border-on-surface/20' :
                                'bg-surface-container text-on-surface-variant border-outline/30'
                              }
                            `}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                           <div className="inline-flex h-4 w-8 items-center border border-outline/40 p-[2px] bg-surface relative">
                             <div className={`h-[10px] w-[10px] shadow-sm absolute transition-all duration-300 ${staff.isActive ? 'bg-primary right-[2px]' : 'bg-outline/50 left-[2px]'} `}></div>
                           </div>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <span className="text-[11px] font-medium text-on-surface-variant tracking-wider">
                             {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric'}) : 'Never'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(staffStatus || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-sm text-on-surface-variant border border-dashed border-outline/30 font-serif italic">No personnel records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
  );  
};

export default AdminDashboard;