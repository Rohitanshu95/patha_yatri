import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { useRoomStore } from '../../store/roomStore';
import { useGuestStore } from '../../store/guestStore';

const Booking = () => {
  const { bookings, isLoading, fetchBookings, createBooking, checkIn, checkOut } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { guests, fetchGuests } = useGuestStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: ""
  });

  useEffect(() => {
    fetchBookings();
    fetchRooms({ status: 'available' });
    fetchGuests();
  }, [fetchBookings, fetchRooms, fetchGuests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setFormData({ guest_id: "", room_id: "", checkInDate: "", checkOutDate: "", specialRequests: "" });
      fetchBookings();
    }
  };

  const handleStatusAction = async (id, currentStatus) => {
    if (currentStatus === 'Confirmed') {
      await checkIn(id);
    } else if (currentStatus === 'CheckedIn') {
      await checkOut(id);
    }
    fetchBookings();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-4">Guest</th>
              <th className="p-4">Room</th>
              <th className="p-4">Check-In</th>
              <th className="p-4">Check-Out</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {(bookings || []).length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center">No bookings found.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{b.guest?.firstName} {b.guest?.lastName}</td>
                  <td className="p-4 font-medium">{b.room?.number}</td>
                  <td className="p-4">{new Date(b.checkInDate).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(b.checkOutDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${b.status === 'CheckedIn' ? 'bg-green-100 text-green-800' : ''}
                      ${b.status === 'CheckedOut' ? 'bg-gray-100 text-gray-800' : ''}
                      ${b.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {b.status === 'Confirmed' && (
                      <button onClick={() => handleStatusAction(b._id, b.status)} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Check In</button>
                    )}
                    {b.status === 'CheckedIn' && (
                      <button onClick={() => handleStatusAction(b._id, b.status)} className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Check Out</button>
                    )}
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
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">New Booking</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Guest</label>
                 <select required value={formData.guest_id} onChange={(e) => setFormData({...formData, guest_id: e.target.value})} className="w-full border rounded-lg p-2">
                   <option value="">Select Guest</option>
                   {guests.map(g => <option key={g._id} value={g._id}>{g.name} ({g.contact})</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                 <select required value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: e.target.value})} className="w-full border rounded-lg p-2">
                   <option value="">Select Available Room</option>
                   {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number} - {r.room_category} (₹{r.price.per_night})</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                   <input type="date" required value={formData.checkInDate} onChange={(e) => setFormData({...formData, checkInDate: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                   <input type="date" required value={formData.checkOutDate} onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                 <textarea value={formData.specialRequests} onChange={(e) => setFormData({...formData, specialRequests: e.target.value})} className="w-full border rounded-lg p-2" rows="2"></textarea>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={isLoading}>{isLoading ? 'Saving...' : 'Book Room'}</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;