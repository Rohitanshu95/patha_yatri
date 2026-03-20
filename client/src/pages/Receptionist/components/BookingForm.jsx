import React, { useEffect, useState } from 'react';
import { useRoomStore } from '../../../store/roomStore';
import { useGuestStore } from '../../../store/guestStore';

const BookingFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const { rooms, fetchRooms } = useRoomStore();
  const { guests, fetchGuests } = useGuestStore();

  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    check_in_date: new Date().toISOString().split('T')[0],
    expected_checkout: "",
    booking_source: "walk-in",
    advance_paid: 0,
    notes: ""
  });

  useEffect(() => {
    fetchRooms({ status: 'available' });
    fetchGuests();
  }, [fetchRooms, fetchGuests]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        guest_id: initialData.guest_id?._id || "",
        room_id: initialData.room_id?._id || "",
        check_in_date: new Date(initialData.check_in_date).toISOString().split('T')[0],
        expected_checkout: new Date(initialData.expected_checkout).toISOString().split('T')[0],
        booking_source: initialData.booking_source || "walk-in",
        advance_paid: initialData.advance_paid || 0,
        notes: initialData.notes || ""
      });
    } else {
      setFormData({
        guest_id: "",
        room_id: "",
        check_in_date: new Date().toISOString().split('T')[0],
        expected_checkout: "",
        booking_source: "walk-in",
        advance_paid: 0,
        notes: ""
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Edit Booking" : "New Booking"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-semibold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest *</label>
              <select 
                required 
                value={formData.guest_id} 
                onChange={(e) => setFormData({...formData, guest_id: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Guest</option>
                {guests.map(g => (
                  <option key={g._id} value={g._id}>{g.name} ({g.contact})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
            <select 
              required 
              value={formData.room_id} 
              onChange={(e) => setFormData({...formData, room_id: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Available Room</option>
              {isEditMode && initialData.room_id && (
                  <option value={initialData.room_id._id}>
                      {initialData.room_id.room_number} - Current Room
                  </option>
              )}
              {rooms.map(r => (
                <option key={r._id} value={r._id}>
                  {r.room_number} - {r.room_category} (₹{r.price.per_night}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
              <input 
                type="date" 
                required 
                disabled={isEditMode}
                value={formData.check_in_date} 
                onChange={(e) => setFormData({...formData, check_in_date: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Check-Out *</label>
              <input 
                type="date" 
                required 
                value={formData.expected_checkout} 
                onChange={(e) => setFormData({...formData, expected_checkout: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select 
                value={formData.booking_source} 
                onChange={(e) => setFormData({...formData, booking_source: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="walk-in">Walk In</option>
                <option value="phone">Phone</option>
                <option value="online">Online</option>
                <option value="OTA">OTA</option>
              </select>
            </div>
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.advance_paid} 
                  onChange={(e) => setFormData({...formData, advance_paid: Number(e.target.value)})} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Special Requests</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              rows="3"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {isEditMode ? "Save Changes" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;