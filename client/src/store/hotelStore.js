import { create } from "zustand";
import axiosInstance from "../config/axios";
import { showError, showSuccess } from "../utils/toast";

const getRequestConfig = (payload) =>
	payload instanceof FormData
		? { headers: { "Content-Type": "multipart/form-data" } }
		: undefined;

const getErrorMessage = (error) =>
	error?.response?.data?.message || error?.message || "Something went wrong";

const getHotelName = (hotel) =>
	typeof hotel?.name === "string" ? hotel.name : "";

export const useHotelStore = create((set, get) => ({
	hotels: [],
	hotel: null,
	hotelNamesById: {},
	pagination: { total: 0, page: 1, pages: 1, limit: 10 },
	isLoading: false,
	error: null,

	fetchHotels: async (filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const res = await axiosInstance.get("/hotels", { params: filters });
			const payload = res.data || {};
			const hotels = Array.isArray(payload.data)
				? payload.data
				: Array.isArray(payload)
					? payload
					: [];

			set({
				hotels,
				pagination: {
					total: Number(payload.total) || hotels.length || 0,
					page: Number(payload.page) || Number(filters.page) || 1,
					pages: Number(payload.pages) || 1,
					limit: Number(filters.limit) || 10,
				},
				isLoading: false,
			});

			return hotels;
		} catch (error) {
			showError(error, "Failed to fetch hotels");
			set({ error: getErrorMessage(error), isLoading: false });
			return [];
		}
	},

	fetchHotelById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const res = await axiosInstance.get(`/hotels/${id}`);
			const hotel = res.data?.data || res.data || null;
			set((state) => ({
				hotel,
				hotelNamesById: hotel?._id
					? {
						...state.hotelNamesById,
						[hotel._id]: getHotelName(hotel),
					}
					: state.hotelNamesById,
				isLoading: false,
			}));
			return hotel;
		} catch (error) {
			showError(error, "Failed to fetch hotel");
			set({ error: getErrorMessage(error), isLoading: false });
			return null;
		}
	},

	fetchHotelNameById: async (id) => {
		const hotelId = String(id || "").trim();
		if (!hotelId) return "";

		const currentNames = get().hotelNamesById || {};
		if (Object.prototype.hasOwnProperty.call(currentNames, hotelId)) {
			return currentNames[hotelId] || "";
		}

		try {
			const res = await axiosInstance.get(`/hotels/${hotelId}`);
			const hotel = res.data?.data || res.data || null;
			const hotelName = getHotelName(hotel);

			set((state) => ({
				hotelNamesById: {
					...state.hotelNamesById,
					[hotelId]: hotelName,
				},
			}));

			return hotelName;
		} catch {
			set((state) => ({
				hotelNamesById: {
					...state.hotelNamesById,
					[hotelId]: "",
				},
			}));
			return "";
		}
	},

	createHotel: async (hotelData) => {
		set({ isLoading: true, error: null });
		try {
			const requestConfig = getRequestConfig(hotelData);
			const res = requestConfig
				? await axiosInstance.post("/hotels", hotelData, requestConfig)
				: await axiosInstance.post("/hotels", hotelData);
			const createdHotel = res.data?.data || res.data;

			if (createdHotel?._id) {
				set((state) => ({
					hotels: [createdHotel, ...state.hotels],
					hotelNamesById: {
						...state.hotelNamesById,
						[createdHotel._id]: getHotelName(createdHotel),
					},
					pagination: {
						...state.pagination,
						total: (Number(state.pagination.total) || state.hotels.length || 0) + 1,
					},
					isLoading: false,
				}));
			} else {
				set({ isLoading: false });
			}

			showSuccess(res.data?.message, "Hotel created");
			return createdHotel;
		} catch (error) {
			showError(error, "Failed to create hotel");
			set({ error: getErrorMessage(error), isLoading: false });
			return null;
		}
	},

	updateHotel: async (id, updateData) => {
		set({ isLoading: true, error: null });
		try {
			const requestConfig = getRequestConfig(updateData);
			const res = requestConfig
				? await axiosInstance.put(`/hotels/${id}`, updateData, requestConfig)
				: await axiosInstance.put(`/hotels/${id}`, updateData);
			const updatedHotel = res.data?.data || res.data;

			set((state) => ({
				hotels: state.hotels.map((item) =>
					item._id === id ? updatedHotel : item,
				),
				hotel: state.hotel?._id === id ? updatedHotel : state.hotel,
				hotelNamesById: updatedHotel?._id
					? {
						...state.hotelNamesById,
						[updatedHotel._id]: getHotelName(updatedHotel),
					}
					: state.hotelNamesById,
				isLoading: false,
			}));

			showSuccess(res.data?.message, "Hotel updated");
			return updatedHotel;
		} catch (error) {
			showError(error, "Failed to update hotel");
			set({ error: getErrorMessage(error), isLoading: false });
			return null;
		}
	},

	deleteHotel: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const res = await axiosInstance.delete(`/hotels/${id}`);

			set((state) => {
				const nextHotels = state.hotels.filter((item) => item._id !== id);
				const nextHotelNamesById = { ...state.hotelNamesById };
				delete nextHotelNamesById[id];
				return {
					hotels: nextHotels,
					hotel: state.hotel?._id === id ? null : state.hotel,
					hotelNamesById: nextHotelNamesById,
					pagination: {
						...state.pagination,
						total: Math.max(0, (Number(state.pagination.total) || state.hotels.length || 0) - 1),
					},
					isLoading: false,
				};
			});

			showSuccess(res.data?.message, "Hotel deleted");
			return true;
		} catch (error) {
			showError(error, "Failed to delete hotel");
			set({ error: getErrorMessage(error), isLoading: false });
			return false;
		}
	},

	clearSelectedHotel: () => {
		set({ hotel: null, error: null });
	},

	clearHotelError: () => {
		set({ error: null });
	},
}));
