import { create } from "zustand";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

export const useBillStore = create((set) => ({
  bills: [],
  payments: [],
  isLoading: false,
  error: null,
  
  fetchBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/bills");
      set({ bills: res.data, isLoading: false });
    } catch (error) {
      showError(error, "Failed to fetch bills");
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBillByBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/bills/booking/${bookingId}`);
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      showError(error, "Failed to fetch bill");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchPayments: async ({ billId, bookingId } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/payments", {
        params: {
          ...(billId ? { billId } : {}),
          ...(bookingId ? { bookingId } : {}),
        },
      });
      set({ payments: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      showError(error, "Failed to fetch payments");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  generateBill: async (bookingId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post("/bills/generate", { bookingId });
      set((state) => {
        const exists = state.bills.find(b => b._id === res.data._id);
        if (exists) {
          return { bills: state.bills.map(b => b._id === res.data._id ? res.data : b), isLoading: false };
        }
        return { bills: [res.data, ...state.bills], isLoading: false };
      });
      showSuccess(res.data?.message, "Bill generated");
      return res.data;
    } catch (error) {
      showError(error, "Failed to generate bill");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  processPayment: async (billId, paymentData) => {
    try {
      set({ isLoading: true });
      // Map frontend data to strictly match backend expected payload
      const payload = {
        bill_id: billId,
        amount: paymentData.amount,
        payment_method: paymentData.method?.toLowerCase() || 'cash', // Fallback to 'cash' 
        transaction_id: paymentData.transaction_id || `txn_${Date.now()}`
      };
      
      const res = await axiosInstance.post(`/payments/record`, payload);
      set((state) => ({
        bills: state.bills.map((b) => b._id === billId ? res.data.bill : b),
        isLoading: false
      }));
      showSuccess(res.data?.message, "Payment recorded");
      return res.data;
    } catch (error) {
       showError(error, "Payment failed");
       set({ error: error.message, isLoading: false });
       return null;
    }
  },

  applyDiscount: async (billId, discountData) => {
    try {
      set({ isLoading: true });
      const payload = { discount: discountData };
      const res = await axiosInstance.patch(`/bills/${billId}/discount`, payload);
      set((state) => ({
        bills: state.bills.map((b) => b._id === billId ? res.data : b),
        isLoading: false,
      }));
      showSuccess(res.data?.message, "Discount applied");
      return res.data;
    } catch (error) {
      showError(error, "Failed to apply discount");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  downloadInvoice: async (billId) => {
     try {
       const res = await axiosInstance.get(`/bills/${billId}/invoice`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `invoice-${billId}.pdf`);
       document.body.appendChild(link);
       link.click();
       link.remove();
     } catch (error) {
       showError(error, "Invoice download failed");
       console.error("PDF download failed", error);
     }
  }
}));