import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useReportStore = create((set) => ({
  revenueData: null,
  gstData: null,
  occupancyData: null,
  isLoading: false,
  error: null,
  
  fetchReports: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const qs = `?startDate=${startDate}&endDate=${endDate}`;
      const [revRes, gstRes, occRes] = await Promise.all([
        axiosInstance.get(`/reports/revenue${qs}`),
        axiosInstance.get(`/reports/gst${qs}`),
        axiosInstance.get(`/reports/occupancy${qs}`)
      ]);
      set({
        revenueData: revRes.data,
        gstData: gstRes.data,
        occupancyData: occRes.data,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));