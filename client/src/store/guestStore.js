import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useGuestStore = create((set, get) => ({
  guests: [],
  isLoading: false,
  error: null,
  
  fetchGuests: async (search = "") => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/guests?search=${search}`);
      set({ guests: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  registerGuest: async (formData) => {
    try {
      const res = await axiosInstance.post("/guests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set((state) => ({ guests: [...state.guests, res.data] }));
      return res.data;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  }
}));