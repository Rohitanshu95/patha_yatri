import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useBillStore = create((set) => ({
  bills: [],
  isLoading: false,
  error: null,
  
  fetchBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/bills");
      set({ bills: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  generateBill: async (bookingId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post("/bills/generate", { bookingId });
      set((state) => ({ bills: [res.data, ...state.bills], isLoading: false }));
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  processPayment: async (billId, paymentData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post(`/payments/\${billId}/pay`, paymentData);
      set((state) => ({
        bills: state.bills.map((b) => b._id === billId ? res.data.bill : b),
        isLoading: false
      }));
      return res.data;
    } catch (error) {
       set({ error: error.message, isLoading: false });
       return null;
    }
  },

  downloadInvoice: async (billId) => {
     try {
       const res = await axiosInstance.get(`/bills/\${billId}/pdf`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `invoice-${billId}.pdf`);
       document.body.appendChild(link);
       link.click();
       link.remove();
     } catch (error) {
       console.error("PDF download failed", error);
     }
  }
}));