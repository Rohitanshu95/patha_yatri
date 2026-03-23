import React, { useMemo, useState } from "react";
import { useGuestStore } from "../../store/guestStore";

const NewBookingModal = ({ isOpen, onClose, onSubmit, guests, rooms, isLoading }) => {
  const { registerQuickGuest } = useGuestStore();
  const [activeGuestTab, setActiveGuestTab] = useState("existing");
  const [guestSearch, setGuestSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    checkInDate: "",
    checkOutDate: "",
    specialRequests: "",
    bookingSource: "walk-in",
    advancePaid: "",
    paymentMethod: "cash",
    paymentNote: "",
  });

  const [newGuest, setNewGuest] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    adults: 1,
    children: 0,
  });

  const selectedRoom = rooms.find((room) => room._id === formData.room_id);
  const selectedGuest = guests.find((guest) => guest._id === formData.guest_id);

  const filteredGuests = useMemo(() => {
    if (!guestSearch) return guests;
    const search = guestSearch.toLowerCase();
    return guests.filter((guest) => {
      return (
        guest.name?.toLowerCase().includes(search) ||
        String(guest.contact || "").toLowerCase().includes(search)
      );
    });
  }, [guestSearch, guests]);

  const nights = useMemo(() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    if (end <= start) return 0;
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [formData.checkInDate, formData.checkOutDate]);

  const roomRate = Number(selectedRoom?.price?.per_night) || 0;
  const taxPercent = Number(selectedRoom?.price?.tax_percent) || 0;
  const roomCharges = nights * roomRate;
  const taxAmount = (roomCharges * taxPercent) / 100;
  const estimatedTotal = roomCharges + taxAmount;
  const advancePaid = Number(formData.advancePaid) || 0;
  const balanceDue = Math.max(0, estimatedTotal - advancePaid);

  const resetForm = () => {
    setActiveGuestTab("existing");
    setGuestSearch("");
    setErrors({});
    setFormData({
      guest_id: "",
      room_id: "",
      checkInDate: "",
      checkOutDate: "",
      specialRequests: "",
      bookingSource: "walk-in",
      advancePaid: "",
      paymentMethod: "cash",
      paymentNote: "",
    });
    setNewGuest({ name: "", contact: "", email: "", address: "", adults: 1, children: 0 });
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.room_id) nextErrors.room_id = "Select a room";
    if (!formData.checkInDate) nextErrors.checkInDate = "Check-in is required";
    if (!formData.checkOutDate) nextErrors.checkOutDate = "Check-out is required";
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      if (end <= start) nextErrors.checkOutDate = "Checkout must be after check-in";
    }

    if (activeGuestTab === "existing") {
      if (!formData.guest_id) nextErrors.guest_id = "Select a guest";
    } else {
      if (!newGuest.name) nextErrors.newGuestName = "Guest name is required";
      if (!newGuest.contact) nextErrors.newGuestContact = "Contact number is required";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    let guestId = formData.guest_id;

    if (activeGuestTab === "new") {
      const guestPayload = {
        name: newGuest.name,
        contact: newGuest.contact,
        email: newGuest.email,
        address: newGuest.address,
        occupants_adults: Number(newGuest.adults) || 1,
        occupants_children: Number(newGuest.children) || 0,
      };

      const guestRes = await registerQuickGuest(guestPayload);
      if (!guestRes) {
        setErrors({ submit: "Unable to register guest. Try again." });
        setIsSubmitting(false);
        return;
      }
      guestId = guestRes._id;
    }

    const payload = {
      guest_id: guestId,
      room_id: formData.room_id,
      check_in_date: formData.checkInDate,
      expected_checkout: formData.checkOutDate,
      notes: formData.specialRequests,
      booking_source: formData.bookingSource,
      advance_paid: Number(formData.advancePaid) || 0,
      payment_method: formData.paymentMethod,
      payment_note: formData.paymentNote,
    };

    const res = await onSubmit(payload);
    if (res) resetForm();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
      <div className="relative bg-surface w-full max-w-5xl m-auto border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-10 pt-10 pb-6 border-b border-outline/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Reservations</p>
            <h2 className="text-3xl font-serif text-on-surface tracking-tight">New Walk-In Booking</h2>
          </div>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 py-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold">
                    Guest Details
                  </h3>
                  <div className="flex items-center gap-2">
                    {["existing", "new"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveGuestTab(tab)}
                        className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] border transition-all ${
                          activeGuestTab === tab
                            ? "bg-primary text-white border-primary"
                            : "bg-surface border-outline/20 text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {tab === "existing" ? "Existing Guest" : "New Guest"}
                      </button>
                    ))}
                  </div>
                </div>

                {activeGuestTab === "existing" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="w-full bg-surface-container border border-outline/30 rounded-none p-3 pl-10 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                        search
                      </span>
                    </div>
                    <select
                      required
                      value={formData.guest_id}
                      onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                      className="w-full bg-surface border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                    >
                      <option value="">Select guest profile</option>
                      {filteredGuests.map((guest) => (
                        <option key={guest._id} value={guest._id}>
                          {guest.name} ({guest.contact})
                        </option>
                      ))}
                    </select>
                    {errors.guest_id && (
                      <p className="text-xs text-red-500">{errors.guest_id}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Guest Name
                        </label>
                        <input
                          value={newGuest.name}
                          onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                          placeholder="Full name"
                        />
                        {errors.newGuestName && (
                          <p className="text-xs text-red-500">{errors.newGuestName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Contact Number
                        </label>
                        <input
                          value={newGuest.contact}
                          onChange={(e) => setNewGuest({ ...newGuest, contact: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                          placeholder="Phone"
                        />
                        {errors.newGuestContact && (
                          <p className="text-xs text-red-500">{errors.newGuestContact}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Email (optional)
                        </label>
                        <input
                          value={newGuest.email}
                          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Address (optional)
                        </label>
                        <input
                          value={newGuest.address}
                          onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Adults
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newGuest.adults}
                          onChange={(e) => setNewGuest({ ...newGuest, adults: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                          Children
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newGuest.children}
                          onChange={(e) => setNewGuest({ ...newGuest, children: e.target.value })}
                          className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      ID verification will be completed at check-in.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mb-4">
                  Room Selection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Check-In
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                    />
                    {errors.checkInDate && (
                      <p className="text-xs text-red-500">{errors.checkInDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                    />
                    {errors.checkOutDate && (
                      <p className="text-xs text-red-500">{errors.checkOutDate}</p>
                    )}
                  </div>
                </div>

                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Assign Suite
                </label>
                <select
                  required
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full bg-surface border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                >
                  <option value="">Select available room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.room_number} - {room.room_category} (₹{room.price?.per_night}) max occupancy: {room.max_occupants})
                    </option>
                  ))}
                </select>
                {errors.room_id && <p className="text-xs text-red-500">{errors.room_id}</p>}

                {selectedRoom && (
                  <div className="mt-4 bg-surface-container border border-outline/20 p-4">
                    <div className="flex justify-between text-sm font-medium text-on-surface">
                      <span>Room {selectedRoom.room_number}</span>
                      <span>₹{roomRate.toLocaleString("en-IN")} / night</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
                      {selectedRoom.room_category} category
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mb-4">
                  Booking Details
                </h3>
                <div className="flex gap-2 mb-6">
                  {[
                    { id: "walk-in", label: "Walk-in" },
                    { id: "phone", label: "Phone" },
                    { id: "OTA", label: "OTA" },
                  ].map((source) => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, bookingSource: source.id })}
                      className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] border transition-all ${
                        formData.bookingSource === source.id
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-outline/20 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>

                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Advance Payment
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.advancePaid}
                  onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                  className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                  placeholder="₹ 0"
                />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Payment Method
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: "cash", label: "Cash" },
                        { id: "card", label: "Card" },
                        { id: "UPI", label: "UPI" },
                        { id: "online", label: "Online" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                          className={`flex-1 px-3 py-2 text-[9px] uppercase tracking-[0.2em] border transition-all ${
                            formData.paymentMethod === method.id
                              ? "bg-primary text-white border-primary"
                              : "bg-surface border-outline/20 text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                      Payment Note
                    </label>
                    <input
                      value={formData.paymentNote}
                      onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                      className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none"
                      placeholder="Advance received at booking"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full bg-surface-container border border-outline/30 rounded-none p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all font-sans resize-none"
                  rows="4"
                  placeholder="Any dietary requirements, early check-in requests, etc..."
                ></textarea>
              </div>

              <div className="bg-surface-container border border-outline/20 p-6">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-3 text-xs uppercase tracking-widest text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Room</span>
                    <span className="text-on-surface">
                      {selectedRoom ? `${selectedRoom.room_category} — ${selectedRoom.room_number}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights</span>
                    <span className="text-on-surface">{nights || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Charges</span>
                    <span className="text-on-surface">₹{roomCharges.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({taxPercent}%)</span>
                    <span className="text-on-surface">₹{taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-outline/20">
                  <div className="flex justify-between text-sm font-semibold text-on-surface">
                    <span>Estimated Total</span>
                    <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant mt-3">
                    <span>Advance Payment</span>
                    <span className="text-on-surface">₹{advancePaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant mt-2">
                    <span>Balance Due</span>
                    <span className="text-primary font-bold">₹{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

          <div className="pt-6 border-t border-outline/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="bg-primary text-white border border-primary px-10 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              {isLoading || isSubmitting ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingModal;