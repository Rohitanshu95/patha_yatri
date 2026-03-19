import { create } from "zustand";
import axios from "../config/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  login: (formData) => async () => {},
  logout: () => async () => {},
}));

export default useAuthStore;
