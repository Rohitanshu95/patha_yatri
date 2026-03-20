import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../config/axios";

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
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
        } catch (error) {
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
