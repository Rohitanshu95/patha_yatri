import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useReceptionistStore = create((set, get) => ({
  dashboardData: {
    pendingArrivals: [],
    inHouse: [],
    todaysDepartures: [],
    roomStatus: {
      available: 0,
      occupied: 0,
      maintenance: 0,
      total: 0,
    },
  },
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/dashboard/receptionist");
      set({ dashboardData: res.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        isLoading: false 
      });
    }
  },

  // We can reuse booking check-in/check-out calls directly from components
  // utilizing the bookingStore or implement them here if needed to directly refresh dashboard.
  checkInGuest: async (id) => {
    try {
      await axiosInstance.patch(`/bookings/${id}/checkin`);
      get().fetchDashboardData(); // Refresh data after action
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      return false;
    }
  },

  checkOutGuest: async (id) => {
    try {
      await axiosInstance.patch(`/bookings/${id}/checkout`);
      get().fetchDashboardData(); // Refresh data after action
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      return false;
    }
  }
}));
