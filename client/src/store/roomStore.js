import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useRoomStore = create((set, get) => ({
  rooms: [],
  pagination: { total: 0, page: 1, pages: 1 },
  isLoading: false,
  error: null,
  
  fetchRooms: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axiosInstance.get(`/rooms?${params}`);
      
      // Check if the response follows the new paginated format
      if (res.data && res.data.data) {
        set({ 
          rooms: res.data.data, 
          pagination: res.data.pagination || { total: res.data.data.length, page: 1, pages: 1 },
          isLoading: false 
        });
      } else {
        // Fallback for older format if needed
        set({ rooms: res.data, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createRoom: async (formData) => {
    try {
      const res = await axiosInstance.post("/rooms", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      set((state) => ({ rooms: [...state.rooms, res.data] }));
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  }
}));