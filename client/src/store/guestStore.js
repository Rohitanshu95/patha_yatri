import { create } from "zustand";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

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
      showError(error, "Failed to fetch guests");
      set({ error: error.message, isLoading: false });
    }
  },

  registerGuest: async (formData) => {
    try {
      const res = await axiosInstance.post("/guests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set((state) => ({ guests: [...state.guests, res.data] }));
      showSuccess(res.data?.message, "Guest registered");
      return res.data;
    } catch (error) {
      showError(error, "Failed to register guest");
      set({ error: error.message });
      return null;
    }
  },

  registerQuickGuest: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const res = await axiosInstance.post("/guests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set((state) => ({ guests: [...state.guests, res.data] }));
      showSuccess(res.data?.message, "Guest registered");
      return res.data;
    } catch (error) {
      showError(error, "Failed to register guest");
      set({ error: error.message });
      return null;
    }
  },

  updateGuest: async (guestId, formData) => {
    try {
      const res = await axiosInstance.put(`/guests/${guestId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        guests: state.guests.map((g) => (g._id === guestId ? res.data : g)),
      }));
      showSuccess(res.data?.message, "Guest updated");
      return res.data;
    } catch (error) {
      showError(error, "Failed to update guest");
      set({ error: error.message });
      return null;
    }
  },
}));