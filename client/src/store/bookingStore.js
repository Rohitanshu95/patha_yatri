import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,
  
  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/bookings");
      set({ bookings: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/bookings", data);
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateBooking: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/bookings/${id}`, data);
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  cancelBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/cancel`);
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  checkIn: async (id) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/checkin`);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  checkOut: async (id) => {
     try {
      const res = await axiosInstance.patch(`/bookings/${id}/checkout`);
      return res.data;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  }
}));