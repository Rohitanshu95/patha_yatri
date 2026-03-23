import { create } from "zustand";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  booking: null,
  isLoading: false,
  error: null,
  
  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/bookings");
      console.log(res.data)
      set({ bookings: res.data, isLoading: false });
    } catch (error) {
      showError(error, "Failed to fetch bookings");
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBookingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/bookings/${id}`);
      set({ booking: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      showError(error, "Failed to fetch booking");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/bookings", data);
      set({ isLoading: false });
      showSuccess(res.data?.message, "Booking created");
      return res.data;
    } catch (error) {
      showError(error, "Failed to create booking");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateBooking: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/bookings/${id}`, data);
      set({ isLoading: false });
      showSuccess(res.data?.message, "Booking updated");
      return res.data;
    } catch (error) {
      showError(error, "Failed to update booking");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  cancelBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/cancel`);
      set({ isLoading: false });
      showSuccess(res.data?.message, "Booking cancelled");
      return res.data;
    } catch (error) {
      showError(error, "Failed to cancel booking");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  checkIn: async (id) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/checkin`);
      showSuccess(res.data?.message, "Check-in successful");
      return res.data;
    } catch (error) {
      showError(error, "Check-in failed");
      set({ error: error.message });
      return null;
    }
  },

  checkOut: async (id) => {
     try {
      const res = await axiosInstance.patch(`/bookings/${id}/checkout`);
      showSuccess(res.data?.message, "Check-out successful");
      return res.data;
    } catch (error) {
      showError(error, "Check-out failed");
      set({ error: error.message });
      return null;
    }
  },

  addService: async (bookingId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post(`/bookings/${bookingId}/services`, data);
      set({ isLoading: false });
      showSuccess(res.data?.message, "Service added");
      return res.data;
    } catch (error) {
      showError(error, "Failed to add service");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  removeService: async (bookingId, serviceId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`/bookings/${bookingId}/services/${serviceId}`);
      set({ isLoading: false });
      showSuccess(res.data?.message, "Service removed");
      return res.data;
    } catch (error) {
      showError(error, "Failed to remove service");
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
}));