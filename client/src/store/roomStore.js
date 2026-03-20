import { create } from "zustand";
import axiosInstance from "../config/axios";

export const useRoomStore = create((set, get) => ({
  rooms: [],
  isLoading: false,
  error: null,
  
  fetchRooms: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axiosInstance.get(`/rooms?${params}`);
      set({ rooms: res.data, isLoading: false });
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