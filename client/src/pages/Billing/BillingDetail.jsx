import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBillStore } from "../../store/billStore";
import { useBookingStore } from "../../store/bookingStore";
import { calculateBillingSummary } from "../../utils/billingCalc";

const BillingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const {
    fetchBillByBooking,
    fetchPayments,
    downloadInvoice,
    applyDiscount,
    processPayment,
    isLoading,
  } = useBillStore();
  const { fetchBookingById } = useBookingStore();

  const [bill, setBill] = useState(null);
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [discountInput, setDiscountInput] = useState(0);
  const [discountType, setDiscountType] = useState("manual");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const refreshData = async () => {
    if (!bookingId) return;
    setIsRefreshing(true);
    const bookingData = await fetchBookingById(bookingId);
    const billData = await fetchBillByBooking(bookingId);
    setBooking(bookingData || null);
    setBill(billData || null);
    if (billData?._id) {
      const paymentList = await fetchPayments({
        bookingId,
        billId: billData._id,
      });
      setPayments(paymentList || []);
    } else {
      setPayments([]);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
  }, [bookingId]);

  useEffect(() => {
    const billDiscount = Number(bill?.discount?.amount) || 0;
    setDiscountInput(billDiscount);
    setDiscountType(bill?.discount?.type || "manual");
  }, [bill?._id]);

  const formatCurrency = (value, maximumFractionDigits = 2) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits })}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN");
  };


  const numberToWords = (value) => {
    const amount = Math.floor(Number(value) || 0);
    if (amount === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const twoDigits = (num) => {
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      const tensPart = tens[Math.floor(num / 10)];
      const onesPart = ones[num % 10];
      return `${tensPart}${onesPart ? ` ${onesPart}` : ""}`.trim();
    };

    const threeDigits = (num) => {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      const hundredText = hundred ? `${ones[hundred]} Hundred` : "";
      const restText = rest ? twoDigits(rest) : "";
      return `${hundredText}${hundredText && restText ? " " : ""}${restText}`.trim();
    };

    let remaining = amount;
    const parts = [];

    const crore = Math.floor(remaining / 10000000);
    if (crore) {
      parts.push(`${threeDigits(crore)} Crore`);
      remaining %= 10000000;
    }

    const lakh = Math.floor(remaining / 100000);
    if (lakh) {
      parts.push(`${threeDigits(lakh)} Lakh`);
      remaining %= 100000;
    }

    const thousand = Math.floor(remaining / 1000);
    if (thousand) {
      parts.push(`${threeDigits(thousand)} Thousand`);
      remaining %= 1000;
    }

    if (remaining) {
      parts.push(threeDigits(remaining));
    }

    return parts.join(" ").trim();
  };

  const latestPayment = payments?.[0];

  const checkOutDate = booking?.check_out_date || booking?.expected_checkout;

  const serviceGroups = useMemo(() => {
    const groupConfig = {
      fooding: { label: "Food / Dining" },
      laundry: { label: "Laundry" },
      spa: { label: "Room Service" },
      other: { label: "Extra Bed / Other" },
    };
    const groups = {
      fooding: { label: groupConfig.fooding.label, qty: 0, amount: 0 },
      laundry: { label: groupConfig.laundry.label, qty: 0, amount: 0 },
      spa: { label: groupConfig.spa.label, qty: 0, amount: 0 },
      other: { label: groupConfig.other.label, qty: 0, amount: 0 },
    };

    const services = booking?.services || [];
    services.forEach((service) => {
      const type = groupConfig[service.type] ? service.type : "other";
      const qty = Number(service.quantity) || 1;
      const unitPrice = Number(service.unit_price ?? service.price) || 0;
      const totalPrice = Number(service.total_price);
      const lineTotal = Number.isFinite(totalPrice) ? totalPrice : unitPrice * qty;
      groups[type].qty += qty;
      groups[type].amount += lineTotal;
    });

    return Object.values(groups);
  }, [booking?.services]);

  const summary = useMemo(
    () => calculateBillingSummary({
      booking,
      bill,
      discountOverride: discountType === "manual" ? discountInput : bill?.discount?.amount,
      applyRounding: true,
    }),
    [booking, bill, discountInput, discountType],
  );

  const {
    roomRate,
    taxPercent,
    nights,
    roomCharge,
    servicesTotal,
    baseSubtotal,
    manualDiscount,
    taxableAmount,
    gstTotal,
    cgst,
    sgst,
    totalBeforeRound,
    roundedTotal,
    roundOff,
    amountPaid,
    balanceDue,
  } = summary;

  const isFullyPaid = balanceDue <= 0 || bill?.status === "paid";
  const isCheckedIn = booking?.status === "checked-in";
  const canCheckout = isFullyPaid && isCheckedIn;

  const totalGuests = useMemo(() => {
    const adults = Number(booking?.guest_id?.occupants?.adults?.count) || Number(booking?.guest_id?.adults);
    const children = Number(booking?.guest_id?.occupants?.children) || Number(booking?.guest_id?.children);
    if (Number.isFinite(adults) || Number.isFinite(children)) {
      return (adults || 0) + (children || 0);
    }
    return "—";
  }, [booking?.guest_id?.adults, booking?.guest_id?.children]);

  const handleApplyDiscount = async () => {
    if (!bill?._id) return;
    setIsApplyingDiscount(true);
    const res = await applyDiscount(bill._id, {
      type: discountType,
      amount: manualDiscount,
    });
    if (res) {
      setBill(res);
      setDiscountType(res?.discount?.type || discountType);
    }
    setIsApplyingDiscount(false);
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!bill?._id) return;
    if (balanceDue <= 0) return;
    const amount = Number(paymentAmount) || balanceDue;
    if (!Number.isFinite(amount) || amount <= 0 || amount > balanceDue) {
      window.alert("Enter a valid amount within the remaining balance.");
      return;
    }
    setIsSubmittingPayment(true);
    const res = await processPayment(bill._id, {
      method: paymentMethod,
      amount,
    });
    setIsSubmittingPayment(false);
    if (res?.bill) {
      setBill(res.bill);
      setPaymentAmount("");
    }
    await refreshData();
  };

  if (isRefreshing && !bill) {
    return (
      <div className="flex-1 min-h-screen bg-[#F8F9FA] p-10">
        <div className="text-[#777777]">Loading invoice...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex-1 min-h-screen bg-[#F8F9FA] p-10">
        <button
          onClick={() => navigate("/app/receptionist/billing")}
          className="flex items-center gap-2 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 hover:translate-x-[-4px] transition-transform"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Transactions
        </button>
        <div className="text-[#777777]">Bill not found.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FA] pb-12">
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-[#D1C5B4]/15 flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/receptionist/billing")}
            className="flex items-center gap-2 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Transactions
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadInvoice(bill._id)}
            className="px-6 py-3 bg-[#C5A059] text-[10px] font-bold uppercase tracking-[0.15em] text-white hover:brightness-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download PDF
          </button>
        </div>
      </header>

      <div className="pt-10 px-8 max-w-6xl mx-auto space-y-10">
        <div className="bg-white border border-[#D1C5B4]/30 shadow-sm p-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
            <div>
              <h3 className="text-2xl font-serif text-[#C5A059] mb-2 uppercase tracking-widest">
                Hotel Invoice / Bill
              </h3>
              <p className="text-xs text-[#777777] uppercase tracking-wider">
                Patha Yatri Hotel
              </p>
              <p className="text-xs text-[#777777] uppercase tracking-wider">
                Hotel Address, Bhubaneswar, Odisha
              </p>
              <p className="text-xs text-[#777777] uppercase tracking-wider">
                Phone: XXXXXXXX | Email: XXXXXXXX
              </p>
              <p className="text-xs text-[#777777] uppercase tracking-wider">
                GSTIN: XXXXXXXX
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#777777] font-bold">Invoice / Tax Invoice</p>
              <p className="text-xl font-serif text-[#222222]">{bill.invoice_number}</p>
              <p className="text-xs text-[#777777] uppercase tracking-wider mt-2">
                Date: {formatDate(bill.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-y border-[#D1C5B4]/20 py-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
                Guest Details
              </p>
              <div className="space-y-2 text-sm text-[#222222]">
                <div>Guest Name: {booking?.guest_id?.name || "—"}</div>
                <div>Mobile No: {booking?.guest_id?.contact || "—"}</div>
                <div>Room No: {booking?.room_id?.room_number || "—"}</div>
                <div>Check-in Date: {formatDate(booking?.check_in_date)}</div>
                <div>Check-out Date: {formatDate(checkOutDate)}</div>
                <div>No. of Nights: {nights}</div>
                <div>No. of Guests: {totalGuests}</div>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
                Payment Details
              </p>
              <div className="space-y-2 text-sm text-[#222222]">
                <div>
                  Payment Mode: {latestPayment?.method || "—"}
                </div>
                <div>Amount Paid: {formatCurrency(amountPaid, 0)}</div>
                <div>Balance Due: {formatCurrency(balanceDue, 0)}</div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
              Itemized Charges
            </p>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-[#777777] border-b border-[#D1C5B4]/40">
                  <th className="pb-3 font-bold">S. No</th>
                  <th className="pb-3 font-bold">Particulars</th>
                  <th className="pb-3 font-bold">Qty</th>
                  <th className="pb-3 font-bold">Rate</th>
                  <th className="pb-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#222222]">
                <tr className="border-b border-[#F8F9FA]">
                  <td className="py-4">1</td>
                  <td className="py-4">Room Charge</td>
                  <td className="py-4">{nights}</td>
                  <td className="py-4">{formatCurrency(roomRate, 0)}</td>
                  <td className="py-4 text-right">{formatCurrency(roomCharge, 0)}</td>
                </tr>
                {serviceGroups.map((group, index) => (
                  <tr key={group.label} className="border-b border-[#F8F9FA]">
                    <td className="py-4">{index + 2}</td>
                    <td className="py-4">{group.label}</td>
                    <td className="py-4">{group.qty || "—"}</td>
                    <td className="py-4">
                      {group.qty ? formatCurrency(group.amount / group.qty, 0) : "—"}
                    </td>
                    <td className="py-4 text-right">{formatCurrency(group.amount, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
                Billing Summary
              </p>
              <div className="space-y-2 text-sm text-[#222222]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(baseSubtotal, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(manualDiscount, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Amount</span>
                  <span>{formatCurrency(taxableAmount, 2)}</span>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#777777] font-bold">
                  GST Breakdown
                </div>
                <div className="flex justify-between">
                  <span>CGST (@ {taxPercent / 2}%)</span>
                  <span>{formatCurrency(cgst, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (@ {taxPercent / 2}%)</span>
                  <span>{formatCurrency(sgst, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total GST</span>
                  <span>{formatCurrency(gstTotal, 2)}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span>Amount Before Round Off</span>
                  <span>{formatCurrency(totalBeforeRound, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Round Off (+/-)</span>
                  <span>{formatCurrency(roundOff, 2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#D1C5B4]/30 pt-3 font-semibold">
                  <span>Grand Total / Amount Payable</span>
                  <span>{formatCurrency(roundedTotal, 0)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
                  Additional Discount
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-[#777777] tracking-[0.2em] block mb-2">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      disabled={isFullyPaid}
                      className="w-full bg-[#F8F9FA] border-b border-[#D1C5B4] focus:border-[#C5A059] focus:ring-0 text-sm text-[#222222] py-3 px-4 outline-none disabled:opacity-60"
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
                    disabled={isFullyPaid || discountType !== "manual"}
                    className="w-full bg-[#F8F9FA] border-b border-[#D1C5B4] focus:border-[#C5A059] focus:ring-0 text-lg font-serif text-[#222222] py-3 px-4 outline-none disabled:opacity-60"
                    placeholder="Enter discount amount"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount || isFullyPaid}
                    className="w-full py-3 bg-[#222222] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all disabled:opacity-60 disabled:hover:bg-[#222222]"
                  >
                    {isApplyingDiscount ? "Applying..." : "Apply Discount"}
                  </button>
                </div>
                {isFullyPaid && (
                  <p className="mt-3 text-xs text-[#777777]">
                    Discount locked after payment.
                  </p>
                )}
                <div className="mt-8 text-sm text-[#222222]">
                  <div className="font-medium">Amount in Words</div>
                  <div className="text-[#777777] mt-2">
                    {numberToWords(roundedTotal)} Only
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => navigate(`/app/receptionist/bookings/${bookingId}`)}
                    disabled={!canCheckout}
                    className="w-full py-3 border border-[#C5A059] text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] hover:text-white transition-all disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[#C5A059]"
                  >
                    Go to Checkout
                  </button>
                  {!canCheckout && (
                    <p className="mt-2 text-xs text-[#777777]">
                      Checkout is enabled only after full payment and when the guest is checked-in.
                    </p>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold mb-4">
                  Record Payment
                </p>
                {balanceDue <= 0 || bill?.status === "paid" ? (
                  <p className="text-sm text-[#777777]">
                    This bill is already fully paid.
                  </p>
                ) : (
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div className="flex gap-px bg-[#D1C5B4]/20 border border-[#D1C5B4]/30">
                      {["Cash", "Card", "UPI", "Online"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                            paymentMethod === method
                              ? "bg-white text-[#C5A059]"
                              : "bg-[#F8F9FA] text-[#777777] hover:text-[#222222]"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-[#777777] tracking-[0.2em] block mb-2">
                        Amount (Rs)
                      </label>
                      <input
                        required
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={balanceDue}
                        min={1}
                        max={balanceDue}
                        className="w-full bg-[#F8F9FA] border-b border-[#D1C5B4] focus:border-[#C5A059] focus:ring-0 text-lg font-serif text-[#222222] py-3 px-4 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingPayment || isLoading}
                      className="w-full py-4 bg-[#C5A059] text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:brightness-105 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingPayment ? "Processing..." : "Submit Payment"}
                      {!isSubmittingPayment && (
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-[#D1C5B4]/20 pt-8 text-center text-sm text-[#777777]">
            <p>Thank you for staying with us! We look forward to serving you again.</p>
            <p className="mt-4">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetail;