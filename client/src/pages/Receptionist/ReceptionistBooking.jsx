import React, { useEffect, useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, User, Edit, Ban, CheckSquare, LogOut } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import BookingFormModal from './components/BookingForm';

const StatusBadge = ({ status }) => {
  const styles = {
    'booked': 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-green-100 text-green-800',
    'checked-out': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const ReceptionistBooking = () => {
  const { bookings, isLoading, fetchBookings, createBooking, updateBooking, checkIn, checkOut, cancelBooking } = useBookingStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenNew = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (selectedBooking) {
      await updateBooking(selectedBooking._id, formData);
    } else {
      await createBooking(formData);
    }
    setIsModalOpen(false);
    fetchBookings();
  };

  const handleAction = async (action, id) => {
    const confirmMsg = {
      checkin: "Confirm check-in for this booking?",
      checkout: "Process check-out for this booking?",
      cancel: "Are you sure you want to cancel this booking?"
    };

    if (window.confirm(confirmMsg[action])) {
      if (action === 'checkin') await checkIn(id);
      if (action === 'checkout') await checkOut(id);
      if (action === 'cancel') await cancelBooking(id);
      fetchBookings();
    }
  };

  const filteredBookings = (bookings || []).filter(b => {
    const matchesSearch = b.guest_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.room_id?.room_number?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Walk-in Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by guest name or room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="booked">Booked (Arrivals)</option>
          <option value="checked-in">Checked In (In-House)</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold">Guest & Contact</th>
                <th className="p-4 font-semibold">Room details</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading records...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No bookings found matching criteria.</td></tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{b.guest_id?.name || 'Walk-in Guest'}</p>
                          <p className="text-xs text-gray-500">{b.guest_id?.contact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">Room {b.room_id?.room_number}</p>
                      <p className="text-xs text-gray-500 capitalize">{b.room_id?.room_category}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="w-3 h-3 text-green-500" />
                          <span>{new Date(b.check_in_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="w-3 h-3 text-red-500" />
                          <span>{new Date(b.expected_checkout).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                      {b.advance_paid > 0 && <p className="text-[10px] text-gray-500 mt-1">₹{b.advance_paid} Adv.</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Action - Only if not checked out/cancelled */}
                        {['booked', 'checked-in'].includes(b.status) && (
                          <button 
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Booking"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* State Transitions */}
                        {b.status === 'booked' && (
                          <button 
                            onClick={() => handleAction('checkin', b._id)}
                            title="Check In"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition border border-transparent hover:border-green-200"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        
                        {b.status === 'checked-in' && (
                          <button 
                            onClick={() => handleAction('checkout', b._id)}
                            title="Check Out"
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition border border-transparent hover:border-orange-200"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancel Action */}
                        {b.status === 'booked' && (
                          <button 
                            onClick={() => handleAction('cancel', b._id)}
                            title="Cancel Booking"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BookingFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        initialData={selectedBooking}
      />
    </div>
  );
};

export default ReceptionistBooking;