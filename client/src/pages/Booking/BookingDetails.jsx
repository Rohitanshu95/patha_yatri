import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useBillStore } from "../../store/billStore";
import { useGuestStore } from "../../store/guestStore";
import AddServiceModal from "./AddServiceModal";
import { calculateBillingSummary } from "../../utils/billingCalc";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    booking,
    isLoading: isBookingLoading,
    fetchBookingById,
    checkIn,
    checkOut,
    cancelBooking,
    addService,
    removeService,
  } = useBookingStore();

  const {
    payments,
    isLoading: isBillingLoading,
    fetchBillByBooking,
    fetchPayments,
    applyDiscount,
    processPayment,
    downloadInvoice,
  } = useBillStore();

  const { updateGuest } = useGuestStore();

  const [bill, setBill] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [proofType, setProofType] = useState("");
  const [proofNumber, setProofNumber] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [applyRounding, setApplyRounding] = useState(false);
  const [discountInput, setDiscountInput] = useState(0);
  const [discountType, setDiscountType] = useState("manual");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const refreshData = async () => {
    if (!id) return;
    setIsRefreshing(true);
    const bookingData = await fetchBookingById(id);
    let nextBill = bookingData?.bill_id || null;
    const billData = await fetchBillByBooking(id);
    if (billData) nextBill = billData;
    setBill(nextBill);
    await fetchPayments({ bookingId: id, billId: nextBill?._id });
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
  }, [id]);


  const statusConfig = {
    "checked-in": {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Checked-In",
    },
    booked: {
      bg: "bg-primary/10",
      border: "border-primary/20",
      text: "text-primary",
      dot: "bg-primary",
      label: "Booked",
    },
    "checked-out": {
      bg: "bg-gray-100",
      border: "border-gray-200",
      text: "text-gray-500",
      dot: "bg-gray-400",
      label: "Checked-Out",
    },
    cancelled: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Cancelled",
    },
  };

  const bookingStatus = booking?.status || "booked";
  const badge = statusConfig[bookingStatus] || statusConfig.booked;
  const canEditServices = ["booked", "checked-in"].includes(bookingStatus) && !isRefreshing;

  const formatDate = (value, withTime = false) => {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const billData = bill || booking?.bill_id;

  useEffect(() => {
    const billDiscount = Number(billData?.discount?.amount) || 0;
    setDiscountInput(billDiscount);
    setDiscountType(billData?.discount?.type || "manual");
  }, [billData?._id]);
  const summary = useMemo(
    () => calculateBillingSummary({
      booking,
      bill: billData,
      discountOverride: discountType === "manual" ? discountInput : billData?.discount?.amount,
      applyRounding,
    }),
    [booking, billData, discountInput, discountType, applyRounding],
  );

  const {
    nights,
    roomCharge,
    servicesTotal,
    manualDiscount,
    gstTotal,
    totalBeforeRound,
    roundOff,
    roundedTotal,
    amountPaid,
    balanceDue,
    hasBillTotals,
  } = summary;

  const isEstimate = !hasBillTotals;
  const totalAmount = roundedTotal;
  const remainingAmount = balanceDue;
  const isFullyPaid = totalAmount > 0 && remainingAmount <= 0;
  const isDiscountLocked = isFullyPaid || billData?.status === "paid";

  const hasProof = Boolean(
    booking?.guest_id?.documents?.id_proof &&
      booking?.guest_id?.documents?.number &&
      booking?.guest_id?.documents?.file_url,
  );

  const handleProofUpload = async (e) => {
    e.preventDefault();
    if (!booking?.guest_id?._id) return;
    if (!proofType || !proofNumber || !proofFile) {
      window.alert("Please provide ID type, number, and file.");
      return;
    }
    const formData = new FormData();
    formData.append("id_proof_type", proofType);
    formData.append("id_proof_number", proofNumber);
    formData.append("id_proof_file", proofFile);
    setIsUploadingProof(true);
    const res = await updateGuest(booking.guest_id._id, formData);
    setIsUploadingProof(false);
    if (res) {
      setProofType("");
      setProofNumber("");
      setProofFile(null);
      await refreshData();
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    await checkIn(booking._id);
    await refreshData();
  };

  const handleCheckOut = async () => {
    if (!booking) return;
    await checkOut(booking._id);
    await refreshData();
  };

  const handleCancel = async () => {
    if (!booking) return;
    const confirmed = window.confirm("Cancel this booking? This action cannot be undone.");
    if (!confirmed) return;
    await cancelBooking(booking._id);
    await refreshData();
  };

  const handleAddServices = async (items) => {
    if (!booking || items.length === 0 || !canEditServices) return;
    for (const item of items) {
      await addService(booking._id, {
        name: item.name,
        type: item.type,
        unit_price: item.unit_price,
        quantity: item.quantity,
        description: item.description,
      });
    }
    setIsServiceModalOpen(false);
    await refreshData();
  };

  const handleRemoveService = async (serviceId) => {
    if (!booking || !serviceId || !canEditServices) return;
    await removeService(booking._id, serviceId);
    await refreshData();
  };

  const handleApplyDiscount = async () => {
    if (!billData?._id || isDiscountLocked) return;
    setIsApplyingDiscount(true);
    const res = await applyDiscount(billData._id, {
      type: discountType,
      amount: manualDiscount,
    });
    if (res) {
      setBill(res);
      setDiscountType(res?.discount?.type || discountType);
      setDiscountInput(Number(res?.discount?.amount) || 0);
    }
    setIsApplyingDiscount(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!billData?._id) return;
    const amount = Number(paymentAmount) || remainingAmount;
    if (remainingAmount <= 0) return;
    if (!Number.isFinite(amount) || amount <= 0 || amount > remainingAmount) {
      window.alert("Enter a valid amount within the remaining balance.");
      return;
    }
    const res = await processPayment(billData._id, {
      method: paymentMethod,
      amount,
    });
    if (res?.bill) {
      setBill(res.bill);
      setPaymentAmount("");
      await fetchPayments({ bookingId: booking?._id, billId: res.bill._id });
      return;
    }
    await refreshData();
  };

  if (isBookingLoading && !booking) {
    return (
      <div className="flex-1 min-h-screen bg-surface p-10">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex-1 min-h-screen bg-surface p-10">
        <div className="text-on-surface-variant">Booking not found.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-surface pb-12">
      <header className="w-full z-30 bg-surface/80 backdrop-blur-xl border-b border-outline/10 px-8 h-20 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/app/receptionist/bookings")}
            className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 hover:translate-x-[-4px] transition-transform"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Reservations
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif text-on-surface">
              {booking.guest_id?.name || "Guest"}
            </h2>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] border ${badge.bg} ${badge.border} ${badge.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            Booking ID: <span className="text-primary">{booking._id}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsServiceModalOpen(true)}
            disabled={!canEditServices}
            className="px-5 py-2.5 border border-outline/20 text-on-surface text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Service
          </button>
          {billData?._id && (
            <button
              onClick={() => downloadInvoice(billData._id)}
              className="px-5 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:brightness-105"
            >
              Download Invoice
            </button>
          )}
        </div>
      </header>

      <div className="px-8 pt-10 max-w-7xl mx-auto space-y-10">
        <section className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleCheckIn}
            disabled={bookingStatus !== "booked" || isRefreshing}
            className="px-6 py-3 bg-on-surface text-primary border border-on-surface text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check-In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={bookingStatus !== "checked-in" || isRefreshing}
            className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Complete Check-Out
          </button>
          <button
            onClick={handleCancel}
            disabled={bookingStatus !== "booked" || isRefreshing}
            className="px-6 py-3 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel Booking
          </button>
          <button
            onClick={refreshData}
            className="ml-auto px-4 py-3 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] hover:text-on-surface flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-base ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
            Refresh
          </button>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-outline/15 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-lg">
                    calendar_month
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                    Stay Details
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6 text-xs uppercase tracking-widest text-on-surface-variant">
                  <div>
                    <p className="mb-2">Check-In</p>
                    <p className="text-on-surface text-sm font-medium tracking-normal">
                      {formatDate(booking.check_in_date, true)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">Expected Checkout</p>
                    <p className="text-on-surface text-sm font-medium tracking-normal">
                      {formatDate(booking.expected_checkout)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">Actual Checkout</p>
                    <p className="text-on-surface text-sm font-medium tracking-normal">
                      {formatDate(booking.check_out_date, true)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">Duration</p>
                    <p className="text-on-surface text-sm font-medium tracking-normal">
                      {nights} {nights === 1 ? "Night" : "Nights"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-outline/15 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-lg">
                    meeting_room
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                    Room Assignment
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Room</span>
                    <span className="text-on-surface text-sm font-medium tracking-normal">
                      {booking.room_id?.room_number || "N/A"} — {booking.room_id?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Category</span>
                    <span className="text-on-surface text-sm font-medium tracking-normal">
                      {booking.room_id?.room_category || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Floor</span>
                    <span className="text-on-surface text-sm font-medium tracking-normal">
                      {booking.room_id?.floor ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Rate / Night</span>
                    <span className="text-on-surface text-sm font-medium tracking-normal">
                      {formatCurrency(booking.room_id?.price?.per_night)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(booking.room_id?.amenities || []).slice(0, 6).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest border border-outline/20 text-on-surface-variant"
                      >
                        {amenity}
                      </span>
                    ))}
                    {(booking.room_id?.amenities || []).length === 0 && (
                      <span className="text-xs text-on-surface-variant">
                        No amenities listed.
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(booking.room_id?.images || []).slice(0, 2).map((src, index) => (
                      <img
                        key={`${src}-${index}`}
                        src={src}
                        alt="Room"
                        className="h-20 w-full object-cover border border-outline/10"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-lg">person</span>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                  Guest Particulars
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Contact
                  </p>
                  <p className="text-on-surface text-sm font-medium">
                    {booking.guest_id?.contact || "—"}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-1">
                    {booking.guest_id?.email || "No email recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Address
                  </p>
                  <p className="text-on-surface text-sm font-medium">
                    {booking.guest_id?.address || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Documents
                  </p>
                  <p className="text-on-surface text-sm font-medium">
                    {booking.guest_id?.documents?.id_proof || "ID"} — {booking.guest_id?.documents?.number || "—"}
                  </p>
                  {booking.guest_id?.documents?.file_url && (
                    <a
                      href={booking.guest_id?.documents?.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs uppercase tracking-widest mt-1 inline-flex items-center gap-2"
                    >
                      View Document
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  )}
                  {!hasProof && (
                    <form onSubmit={handleProofUpload} className="mt-4 space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-[0.2em] block mb-2">
                          ID Proof Type
                        </label>
                        <select
                          value={proofType}
                          onChange={(e) => setProofType(e.target.value)}
                          className="w-full bg-surface-container border border-outline/20 px-3 py-2 text-xs uppercase tracking-widest"
                        >
                          <option value="">Select Type</option>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="PAN">PAN</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-[0.2em] block mb-2">
                          ID Number
                        </label>
                        <input
                          type="text"
                          value={proofNumber}
                          onChange={(e) => setProofNumber(e.target.value)}
                          className="w-full bg-surface-container border border-outline/20 px-3 py-2 text-xs tracking-widest"
                          placeholder="Enter document number"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-[0.2em] block mb-2">
                          Upload Proof
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-on-surface-variant"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isUploadingProof}
                        className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                      >
                        {isUploadingProof ? "Uploading..." : "Upload Proof"}
                      </button>
                    </form>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Occupants
                  </p>
                  <p className="text-on-surface text-sm font-medium">
                    Total: {booking.guest_id?.occupants?.total ?? 0}
                  </p>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Adults: {booking.guest_id?.occupants?.adults?.count ?? 0} (M {booking.guest_id?.occupants?.adults?.male ?? 0} / F {booking.guest_id?.occupants?.adults?.female ?? 0})
                  </p>
                  <p className="text-on-surface-variant text-xs">
                    Children: {booking.guest_id?.occupants?.children ?? 0}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">notes</span>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                  Manager Notes
                </h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {booking.notes || "No notes recorded for this booking."}
              </p>
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">room_service</span>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                    Active Services & Add-ons
                  </h3>
                </div>
                <button
                  onClick={() => setIsServiceModalOpen(true)}
                  disabled={!canEditServices}
                  className="text-primary text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add Service
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Qty</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(booking.services || []).map((service) => (
                      <tr key={service._id} className="border-b border-outline/5">
                        <td className="py-4">
                          <p className="text-on-surface font-medium">{service.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDate(service.served_at)}
                          </p>
                        </td>
                        <td className="py-4 text-on-surface-variant uppercase text-xs tracking-widest">
                          {service.type || "other"}
                        </td>
                        <td className="py-4 text-on-surface">
                          {service.quantity || 1}
                        </td>
                        <td className="py-4 text-on-surface font-semibold">
                          {formatCurrency(service.total_price || service.unit_price || service.price)}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveService(service._id)}
                            disabled={!canEditServices}
                            className="text-red-500 text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(booking.services || []).length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                          No services recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-lg">payments</span>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                  Payment History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Collector</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(payments || []).map((payment) => (
                      <tr key={payment._id} className="border-b border-outline/5">
                        <td className="py-4 text-on-surface">
                          {formatDate(payment.payment_date, true)}
                        </td>
                        <td className="py-4 text-on-surface-variant uppercase text-xs tracking-widest">
                          {payment.method}
                        </td>
                        <td className="py-4 text-on-surface">
                          {payment.collected_by?.name || "—"}
                        </td>
                        <td className="py-4">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-on-surface font-semibold">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                    {(payments || []).length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                          No payment records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <section className="bg-surface border border-outline/15 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">
                  Financial Summary
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  {isEstimate ? "Estimated" : billData?.status}
                </span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Room Tariff ({nights} nights)</span>
                  <span className="text-on-surface font-medium">
                    {formatCurrency(roomCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Service Charges</span>
                  <span className="text-on-surface font-medium">
                    {formatCurrency(servicesTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Taxes & Levies</span>
                  <span className="text-on-surface font-medium">
                    {formatCurrency(gstTotal)}
                  </span>
                </div>
              </div>
              <div className="mt-6 border-t border-outline/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                    Total Billable
                  </span>
                  <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={applyRounding}
                      onChange={(e) => setApplyRounding(e.target.checked)}
                      className="h-3 w-3 border-outline/30"
                    />
                    {applyRounding ? "Rounded" : "Actual"}
                  </label>
                  <span className="text-2xl font-serif text-on-surface">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                {applyRounding && (
                  <div className="mt-3 text-xs uppercase tracking-widest text-on-surface-variant">
                    <div className="flex justify-between">
                      <span>Amount Before Round Off</span>
                      <span className="text-on-surface font-medium">
                        {formatCurrency(totalBeforeRound)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Round Off (+/-)</span>
                      <span className="text-on-surface font-medium">
                        {formatCurrency(roundOff)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-4 bg-surface-container border border-outline/10 p-4">
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Advance Paid</span>
                    <span className="text-on-surface font-bold">
                      {formatCurrency(amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant mt-3">
                    <span>Balance Due</span>
                    <span className="text-primary font-bold">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface mb-6">
                Additional Discount
              </h3>
              {!billData?._id ? (
                <p className="text-sm text-on-surface-variant">
                  Generate a bill before applying discounts.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-[0.2em] block mb-2">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      disabled={isDiscountLocked}
                      className="w-full bg-surface-container border border-outline/20 px-3 py-2 text-xs uppercase tracking-widest disabled:opacity-60"
                    >
                      <option value="seasonal">Seasonal</option>
                      <option value="loyalty">Loyalty</option>
                      <option value="corporate">Corporate</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    disabled={isDiscountLocked || discountType !== "manual"}
                    className="w-full bg-surface-container border-b border-outline/30 focus:border-primary focus:ring-0 text-lg font-serif text-on-surface py-3 px-4 outline-none disabled:opacity-60"
                    placeholder="Enter discount amount"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount || isDiscountLocked}
                    className="w-full py-3 bg-on-surface text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-60"
                  >
                    {isApplyingDiscount ? "Applying..." : "Apply Discount"}
                  </button>
                </div>
              )}
              {isDiscountLocked && billData?._id && (
                <p className="mt-3 text-xs text-on-surface-variant">
                  Discount locked after payment.
                </p>
              )}
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface mb-6">
                Record Payment
              </h3>
              {!billData?._id || totalAmount <= 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Generate a bill before accepting payments.
                </p>
              ) : isFullyPaid || billData.status === "paid" ? (
                <p className="text-sm text-on-surface-variant">
                  This bill is already fully paid.
                </p>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="flex gap-px bg-outline/10 border border-outline/10">
                    {["Cash", "Card", "UPI"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                          paymentMethod === method
                            ? "bg-surface text-primary"
                            : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-[0.2em] block mb-2">
                      Amount (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={remainingAmount}
                      min={1}
                      max={remainingAmount}
                      className="w-full bg-surface-container border-b border-outline/30 focus:border-primary focus:ring-0 text-lg font-serif text-on-surface py-3 px-4 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isBillingLoading}
                    className="w-full py-4 bg-primary text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:brightness-105 transition-all flex items-center justify-center gap-2"
                  >
                    {isBillingLoading ? "Processing..." : "Submit Payment"}
                    {!isBillingLoading && (
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    )}
                  </button>
                </form>
              )}
            </section>

            <section className="bg-surface border border-outline/15 p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface mb-4">
                Booking Metadata
              </h3>
              <div className="space-y-3 text-xs uppercase tracking-widest text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Source</span>
                  <span className="text-on-surface">
                    {booking.booking_source || "walk-in"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Created</span>
                  <span className="text-on-surface">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice</span>
                  <span className="text-on-surface">
                    {billData?.invoice_number || "Pending"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        booking={booking}
        onSubmit={handleAddServices}
      />
    </div>
  );
};

export default BookingDetails;