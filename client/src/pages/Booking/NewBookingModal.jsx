import React, { useState } from 'react';

const NewBookingModal = ({ isOpen, onClose, onSubmit, guests, rooms, isLoading }) => {
  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset internal state if the parent doesn't unmount it immediately
    setFormData({ guest_id: "", room_id: "", checkInDate: "", checkOutDate: "", specialRequests: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
      <div className="relative p-10 bg-surface w-full max-w-2xl m-auto border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center mb-8 border-b border-surface-container pb-4">
          <h2 className="text-2xl font-serif text-on-surface tracking-tight">Initiate New Booking</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Guest Profile</label>
              <select 
                required 
                value={formData.guest_id} 
                onChange={(e) => setFormData({...formData, guest_id: e.target.value})} 
                className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all"
              >
                <option value="">Select Associated Guest</option>
                {guests.map(g => <option key={g._id} value={g._id}>{g.name} ({g.contact})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Assign Suite</label>
              <select 
                required 
                value={formData.room_id} 
                onChange={(e) => setFormData({...formData, room_id: e.target.value})} 
                className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all"
              >
                <option value="">Select Available Room</option>
                {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number} - {r.room_category} (₹{r.price?.per_night})</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Check-In Date</label>
              <input 
                type="date" 
                required 
                value={formData.checkInDate} 
                onChange={(e) => setFormData({...formData, checkInDate: e.target.value})} 
                className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Check-Out Date</label>
              <input 
                type="date" 
                required 
                value={formData.checkOutDate} 
                onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})} 
                className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Concierge Notes & Restrictions</label>
            <textarea 
              value={formData.specialRequests} 
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})} 
              className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all font-sans resize-none" 
              rows="3"
              placeholder="Any dietary requirements, early check-in requests, etc..."
            ></textarea>
          </div>

          <div className="pt-6 border-t border-surface-container flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bg-primary text-white border border-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
              {isLoading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingModal;