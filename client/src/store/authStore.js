import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.post("/auth/login", formData);
          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          showSuccess(res.data?.message, "Login successful");
          return true;
        } catch (error) {
          showError(error, "Login failed");
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
          });
          return false;
        }
      },

      logout: async () => {
        try {
          const res = await axiosInstance.post("/auth/logout");
          showSuccess(res.data?.message, "Logout successful");
        } catch (error) {
          showError(error, "Logout failed");
          console.error("Logout error", error);
        } finally {
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      fetchMe: async () => {
        try {
          const res = await axiosInstance.get("/auth/me");
          set({ user: res.data.user, isAuthenticated: true });
        } catch (error) {
          showError(error, "Failed to fetch session");
          set({ user: null, isAuthenticated: false });
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
