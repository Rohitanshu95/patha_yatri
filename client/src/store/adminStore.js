import { create } from "zustand";
import { showError } from "../utils/toast";
import axios from './../config/axios';

const useAdminStore = create((set) => ({
  dashboardData: null,
  isLoading: true,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get("/dashboard/admin", {
        withCredentials: true,
      });
      set({ dashboardData: res.data, isLoading: false });
    } catch (error) {
      showError(error, "Failed to fetch dashboard data");
      console.error("Error fetching admin dashboard:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
    }
  },
}));

export default useAdminStore;
