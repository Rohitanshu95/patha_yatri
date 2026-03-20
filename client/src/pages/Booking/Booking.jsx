import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { useRoomStore } from '../../store/roomStore';
import { useGuestStore } from '../../store/guestStore';
import NewBookingModal from './NewBookingModal';

const Booking = () => {
  const { bookings, isLoading, fetchBookings, createBooking, checkIn, checkOut } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { guests, fetchGuests } = useGuestStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchRooms({ status: 'available' });
    fetchGuests();
  }, [fetchBookings, fetchRooms, fetchGuests]);

  const handleSubmitNewBooking = async (formData) => {
    const payload = {
      guest_id: formData.guest_id,
      room_id: formData.room_id,
      check_in_date: formData.checkInDate,
      expected_checkout: formData.checkOutDate,
      notes: formData.specialRequests,
      booking_source: "walk-in",
      advance_paid: 0
    };
    const res = await createBooking(payload);
    if (res) {
      setIsModalOpen(false);
      fetchBookings();
    }
  };

  const handleStatusAction = async (id, currentStatus) => {
    if (currentStatus === 'booked') {
      await checkIn(id);
    } else if (currentStatus === 'checked-in') {
      await checkOut(id);
    }
    fetchBookings();
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const statusConfig = {
    'checked-in': { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Checked-In' },
    'booked': { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', dot: 'bg-primary', label: 'Booked' },
    'checked-out': { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Checked-Out' },
    'cancelled': { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelled' }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === "All" || b.status?.toLowerCase() === filter.toLowerCase();
    const searchString = searchQuery.toLowerCase();
    const guestMatch = b.guest_id?.name?.toLowerCase().includes(searchString) || b.guest_id?.contact?.includes(searchString);
    const roomMatch = b.room_id?.room_number?.toString().includes(searchString);
    return matchesFilter && (searchQuery === "" || guestMatch || roomMatch);
  });

  const checkedInCount = bookings.filter(b => b.status === "checked-in").length;
  const bookedCount = bookings.filter(b => b.status === "booked").length;
  const checkedOutCount = bookings.filter(b => b.status === "checked-out").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  return (
    <>
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-on-surface tracking-tight">Reservation Portfolio</h2>
          <p className="text-on-surface-variant text-sm font-medium mt-3">Manage all guest bookings and current stays</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-surface border border-outline/20 text-on-surface font-semibold px-6 py-3 flex items-center gap-3 hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            <span className="text-xs uppercase tracking-wider">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-on-surface text-primary border border-on-surface font-medium px-8 py-3 rounded-none flex items-center gap-3 hover:bg-gold-gradient hover:text-white hover:border-transparent transition-all uppercase text-xs tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>New Booking</span>
          </button>
        </div>
      </section>

      {/* Filter Row */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 border-b border-outline/10 pb-4">
        <div className="flex overflow-x-auto w-full xl:w-auto scrollbar-hide pb-2 xl:pb-0 gap-2">
          {["All", "Checked-In", "Booked", "Checked-Out", "Cancelled"].map((item) => {
            let countLabel = "";
            if(item === "All") countLabel = `(${bookings.length})`;
            if(item === "Checked-In") countLabel = `(${checkedInCount})`;
            if(item === "Booked") countLabel = `(${bookedCount})`;
            if(item === "Checked-Out") countLabel = `(${checkedOutCount})`;
            if(item === "Cancelled") countLabel = `(${cancelledCount})`;

            return (
              <button 
                key={item}
                onClick={() => setFilter(item === "Booked" ? "booked" : item)}
                className={`px-6 py-2 whitespace-nowrap transition-all text-sm tracking-tight ${filter.toLowerCase() === item.toLowerCase() || (item === "Booked" && filter === "booked") ? "text-primary font-bold border-b-2 border-primary -mb-[18px]" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {item} {countLabel}
              </button>
            )
          })}
        </div>
        <div className="relative w-full xl:w-80">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border border-outline/20 rounded-none py-2.5 pl-4 pr-12 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant outline-none" 
            placeholder="Search guests, rooms..." 
            type="text"
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        </div>
      </section>

      {/* Table Section */}
      <div className="bg-surface rounded-none overflow-x-auto shadow-sm border border-outline/20 mb-8">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Guest</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Room</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Check-In</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Exp. Checkout</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Nights</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Source</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/10">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-on-surface-variant">No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const sConf = statusConfig[booking.status?.toLowerCase()] || statusConfig['booked'];
                const nights = calculateNights(booking.check_in_date, booking.expected_checkout);
                
                return (
                  <tr key={booking._id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden text-primary font-serif font-bold">
                          {booking.guest_id?.name ? booking.guest_id.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface leading-none">{booking.guest_id?.name || 'Unknown'}</p>
                          <p className="text-xs text-on-surface-variant mt-1">{booking.guest_id?.contact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-on-surface">
                      {booking.room_id ? `${booking.room_id.room_category} ${booking.room_id.room_number}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {new Date(booking.expected_checkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{nights || 1}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-outline/20 text-on-surface capitalize">
                        {booking.booking_source || 'Walk-in'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${sConf.bg} ${sConf.text} ${sConf.border} border`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`}></span> {sConf.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {booking.status === 'booked' && (
                          <button 
                            onClick={() => handleStatusAction(booking._id, 'booked')}
                            className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                            title="Check In"
                          >
                            Check-In
                          </button>
                        )}
                        {booking.status === 'checked-in' && (
                          <button 
                            onClick={() => handleStatusAction(booking._id, 'checked-in')}
                            className="px-3 py-1 bg-surface-container border border-outline/30 text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                            title="Check Out"
                          >
                            Check-Out
                          </button>
                        )}
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="p-2 text-on-surface-variant hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">receipt_long</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Re-styled to Gold Slate Minimal */}
      <NewBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmitNewBooking} 
        guests={guests} 
        rooms={rooms} 
        isLoading={isLoading} 
      />
    </>
  );
}

export default Booking;