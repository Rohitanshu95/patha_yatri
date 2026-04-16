import { create } from "zustand";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

const sanitizeFilters = (filters = {}) => {
  const next = { ...filters };

  if (!next.search) delete next.search;
  if (!next.role || next.role === "all") delete next.role;
  if (!next.hotel || next.hotel === "all") delete next.hotel;
  if (!next.status || next.status === "all") delete next.status;
  if (!next.sort) delete next.sort;

  return next;
};

export const useUserStore = create((set) => ({
  users: [],
  pagination: { total: 0, page: 1, pages: 1, limit: 10 },
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchUsers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = sanitizeFilters(filters);
      const res = await axiosInstance.get("/users", { params });
      const payload = res.data || {};
      const users = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      const pagination = payload.pagination || {};

      set({
        users,
        pagination: {
          total: Number(pagination.total) || users.length || 0,
          page: Number(pagination.page) || Number(filters.page) || 1,
          pages: Number(pagination.pages) || 1,
          limit: Number(pagination.limit) || Number(filters.limit) || 10,
        },
        isLoading: false,
      });

      return users;
    } catch (error) {
      showError(error, "Failed to fetch users");
      set({ error: getErrorMessage(error), isLoading: false });
      return [];
    }
  },

  createUser: async (payload) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/users", payload);
      const createdUser = res.data?.user || null;

      if (createdUser?._id) {
        set((state) => ({
          users: [createdUser, ...state.users],
          pagination: {
            ...state.pagination,
            total: (Number(state.pagination.total) || state.users.length || 0) + 1,
          },
          isActionLoading: false,
        }));
      } else {
        set({ isActionLoading: false });
      }

      showSuccess(res.data?.message, "User created successfully");
      return createdUser;
    } catch (error) {
      showError(error, "Failed to create user");
      set({ error: getErrorMessage(error), isActionLoading: false });
      return null;
    }
  },

  updateUser: async (id, payload) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`/users/${id}`, payload);
      const updatedUser = res.data?.user || null;

      if (updatedUser?._id) {
        set((state) => ({
          users: state.users.map((user) => (user._id === id ? updatedUser : user)),
          isActionLoading: false,
        }));
      } else {
        set({ isActionLoading: false });
      }

      showSuccess(res.data?.message, "User updated successfully");
      return updatedUser;
    } catch (error) {
      showError(error, "Failed to update user");
      set({ error: getErrorMessage(error), isActionLoading: false });
      return null;
    }
  },

  deactivateUser: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`/users/${id}`);
      const updatedUser = res.data?.user || null;

      if (updatedUser?._id) {
        set((state) => ({
          users: state.users.map((user) => (user._id === id ? updatedUser : user)),
          isActionLoading: false,
        }));
      } else {
        set({ isActionLoading: false });
      }

      showSuccess(res.data?.message, "User deactivated successfully");
      return true;
    } catch (error) {
      showError(error, "Failed to deactivate user");
      set({ error: getErrorMessage(error), isActionLoading: false });
      return false;
    }
  },

  activateUser: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/users/${id}/activate`);
      const updatedUser = res.data?.user || null;

      if (updatedUser?._id) {
        set((state) => ({
          users: state.users.map((user) => (user._id === id ? updatedUser : user)),
          isActionLoading: false,
        }));
      } else {
        set({ isActionLoading: false });
      }

      showSuccess(res.data?.message, "User activated successfully");
      return true;
    } catch (error) {
      showError(error, "Failed to activate user");
      set({ error: getErrorMessage(error), isActionLoading: false });
      return false;
    }
  },

  resetUserPassword: async (id, newPassword) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/users/${id}/password`, { newPassword });
      set({ isActionLoading: false });
      showSuccess(res.data?.message, "Password updated successfully");
      return true;
    } catch (error) {
      showError(error, "Failed to update password");
      set({ error: getErrorMessage(error), isActionLoading: false });
      return false;
    }
  },

  clearUserError: () => set({ error: null }),
}));
