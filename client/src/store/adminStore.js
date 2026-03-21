import { create } from "zustand";
import axios from "axios";

const useAdminStore = create((set) => ({
  dashboardData: null,
  isLoading: true,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get("/api/dashboard/admin", {
        withCredentials: true,
      });
      set({ dashboardData: res.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
    }
  },
}));

export default useAdminStore;
