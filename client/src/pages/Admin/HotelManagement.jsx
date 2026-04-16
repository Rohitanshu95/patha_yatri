import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axios";
import { useHotelStore } from "../../store/hotelStore";

const PAGE_LIMIT = 10;

const AMENITY_OPTIONS = [
  "Bathroom Amenities",
  "CCTV",
  "Complementary Breakfast",
  "Conference Facilities",
  "Doctor on Call",
  "Dry Cleaning",
  "Laundry (At A Charge)",
  "Local Tour Travel Desk",
  "Newspapers In Lobby",
  "Parking Facilities Available",
  "Restaurant",
  "Running Hot Water",
  "Wake-up Call Service",
];

const getEmptyFormState = () => ({
  name: "",
  locationAddress: "",
  locationDescription: "",
  locationMapLocation: "",
  manager: "",
  receptionists: [],
  amenities: [],
  phone: [],
  website: "",
  proximityAirport: "",
  proximityBusStation: "",
  proximityTrainStation: "",
  existingPhotos: [],
  newPhotos: [],
});

const normalizeId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || "" : String(value);
};

const toStringArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
        .filter(Boolean)
    : [];

const sanitizeAmenities = (value) =>
  toStringArray(value).filter((item) => AMENITY_OPTIONS.includes(item));

const isStaffSelectableForHotel = (user, hotelId, selectedIds) => {
  if (user?.isActive === false) return false;

  const userId = normalizeId(user?._id);
  if (selectedIds.has(userId)) return true;

  const userHotelId = normalizeId(user?.hotel);
  if (!userHotelId) return true;

  return Boolean(hotelId && userHotelId === hotelId);
};

const HotelManagement = () => {
  const {
    hotels,
    pagination,
    isLoading,
    error,
    fetchHotels,
    createHotel,
    updateHotel,
    deleteHotel,
    clearHotelError,
  } = useHotelStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  const [formState, setFormState] = useState(getEmptyFormState);
  const [phoneInput, setPhoneInput] = useState("");

  const [managers, setManagers] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchHotels({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
    });
  }, [fetchHotels, currentPage, debouncedSearch]);

  useEffect(() => {
    const totalPages = pagination?.pages || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pagination?.pages]);

  useEffect(() => {
    let mounted = true;

    const fetchStaffOptions = async () => {
      setIsStaffLoading(true);
      setStaffError("");
      try {
        const [managerRes, receptionistRes] = await Promise.all([
          axiosInstance.get("/users/options", { params: { role: "manager" } }),
          axiosInstance.get("/users/options", { params: { role: "receptionist" } }),
        ]);

        if (!mounted) return;

        const managerList = Array.isArray(managerRes.data)
          ? managerRes.data.filter((user) => user?.isActive !== false)
          : [];
        const receptionistList = Array.isArray(receptionistRes.data)
          ? receptionistRes.data.filter((user) => user?.isActive !== false)
          : [];

        setManagers(managerList);
        setReceptionists(receptionistList);
      } catch (fetchError) {
        if (!mounted) return;
        const message =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "Unable to load staff options";
        setStaffError(message);
      } finally {
        if (mounted) setIsStaffLoading(false);
      }
    };

    fetchStaffOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination?.pages || 1;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    const pages = [];
    for (let page = adjustedStart; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, pagination?.pages]);

  const currentHotelId = modalMode === "edit" ? normalizeId(selectedHotel?._id) : "";

  const availableManagers = useMemo(
    () => {
      const selectedManagerIds = formState.manager ? new Set([formState.manager]) : new Set();
      return managers.filter((user) =>
        isStaffSelectableForHotel(user, currentHotelId, selectedManagerIds)
      );
    },
    [managers, formState.manager, currentHotelId]
  );

  const availableReceptionists = useMemo(
    () => {
      const selectedReceptionistIds = new Set(formState.receptionists || []);
      return receptionists.filter((user) =>
        isStaffSelectableForHotel(user, currentHotelId, selectedReceptionistIds)
      );
    },
    [receptionists, formState.receptionists, currentHotelId]
  );

  const resetForm = () => {
    setFormState(getEmptyFormState());
    setPhoneInput("");
  };

  const openCreateModal = () => {
    clearHotelError();
    setModalMode("create");
    setSelectedHotel(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (hotel) => {
    clearHotelError();
    const managerId = normalizeId(hotel?.manager);
    const receptionistIds = Array.isArray(hotel?.receptionists)
      ? hotel.receptionists
          .map((item) => normalizeId(item))
          .filter(Boolean)
      : [];

    setModalMode("edit");
    setSelectedHotel(hotel);
    setFormState({
      name: hotel?.name || "",
      locationAddress: hotel?.location?.address || "",
      locationDescription: hotel?.location?.description || "",
      locationMapLocation: hotel?.location?.map_location || "",
      manager: managerId,
      receptionists: receptionistIds,
      amenities: sanitizeAmenities(hotel?.amenities),
      phone: toStringArray(hotel?.phone),
      website: hotel?.website || "",
      proximityAirport:
        hotel?.proximity?.airport !== undefined ? String(hotel.proximity.airport) : "",
      proximityBusStation:
        hotel?.proximity?.bus_station !== undefined ? String(hotel.proximity.bus_station) : "",
      proximityTrainStation:
        hotel?.proximity?.train_station !== undefined
          ? String(hotel.proximity.train_station)
          : "",
      existingPhotos: toStringArray(hotel?.photos),
      newPhotos: [],
    });
    setPhoneInput("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
    resetForm();
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination?.pages || 1)) return;
    setCurrentPage(nextPage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const toggleAmenity = (amenity) => {
    if (!AMENITY_OPTIONS.includes(amenity)) return;

    setFormState((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addPhone = () => {
    const value = phoneInput.trim();
    if (!value) return;

    setFormState((prev) => {
      if (prev.phone.includes(value)) return prev;
      return { ...prev, phone: [...prev.phone, value] };
    });
    setPhoneInput("");
  };

  const removePhone = (phone) => {
    setFormState((prev) => ({
      ...prev,
      phone: prev.phone.filter((item) => item !== phone),
    }));
  };

  const toggleReceptionist = (receptionistId) => {
    setFormState((prev) => {
      const exists = prev.receptionists.includes(receptionistId);
      return {
        ...prev,
        receptionists: exists
          ? prev.receptionists.filter((item) => item !== receptionistId)
          : [...prev.receptionists, receptionistId],
      };
    });
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setFormState((prev) => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...files].slice(0, 5),
    }));

    event.target.value = "";
  };

  const removeNewPhoto = (indexToRemove) => {
    setFormState((prev) => ({
      ...prev,
      newPhotos: prev.newPhotos.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeExistingPhoto = (photoUrl) => {
    setFormState((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((url) => url !== photoUrl),
    }));
  };

  const buildHotelPayload = () => {
    const payload = new FormData();

    payload.append("name", formState.name.trim());
    payload.append(
      "location",
      JSON.stringify({
        address: formState.locationAddress.trim(),
        description: formState.locationDescription.trim(),
        map_location: formState.locationMapLocation.trim(),
      })
    );

    const selectedAmenities = formState.amenities.filter((item) =>
      AMENITY_OPTIONS.includes(item)
    );

    payload.append("manager", formState.manager);
    payload.append("receptionists", JSON.stringify(formState.receptionists));
    payload.append("amenities", JSON.stringify(selectedAmenities));
    payload.append("phone", JSON.stringify(formState.phone));

    if (formState.website.trim()) {
      payload.append("website", formState.website.trim());
    }

    const proximityPayload = {};
    if (formState.proximityAirport !== "") {
      proximityPayload.airport = Number(formState.proximityAirport);
    }
    if (formState.proximityBusStation !== "") {
      proximityPayload.bus_station = Number(formState.proximityBusStation);
    }
    if (formState.proximityTrainStation !== "") {
      proximityPayload.train_station = Number(formState.proximityTrainStation);
    }

    if (Object.keys(proximityPayload).length > 0) {
      payload.append("proximity", JSON.stringify(proximityPayload));
    }

    if (modalMode === "edit") {
      payload.append("existing_photos", JSON.stringify(formState.existingPhotos));
    }

    formState.newPhotos.forEach((file) => {
      payload.append("photos", file);
    });

    return payload;
  };

  const refreshCurrentList = async () => {
    await fetchHotels({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = buildHotelPayload();
    const result =
      modalMode === "create"
        ? await createHotel(payload)
        : await updateHotel(selectedHotel?._id, payload);

    if (!result) return;

    closeModal();

    if (modalMode === "create" && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await refreshCurrentList();
  };

  const openDeleteDialog = (hotel) => {
    clearHotelError();
    setHotelToDelete(hotel);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hotelToDelete?._id) return;

    const success = await deleteHotel(hotelToDelete._id);
    if (!success) return;

    setIsDeleteModalOpen(false);
    setHotelToDelete(null);

    const shouldGoPrevPage = hotels.length === 1 && currentPage > 1;
    if (shouldGoPrevPage) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
      return;
    }

    await refreshCurrentList();
  };

  const totalHotels = pagination?.total || 0;

  return (
    <div className="min-h-full font-body text-on-surface">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Hotel Portfolio</h2>
          <p className="mt-3 text-sm text-on-surface-variant font-medium">
            Managing {totalHotels} property records across the network
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-surface border border-outline/20 px-4 py-3 min-w-65">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent border-none focus:ring-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant w-full"
              placeholder="Search hotels or locations..."
            />
          </div>

          <button
            onClick={openCreateModal}
            className="bg-neutral-900 text-white border border-neutral-900 font-bold px-8 py-3 flex items-center gap-2 hover:bg-primary hover:border-primary transition-all uppercase text-xs tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">add_business</span>
            Add Hotel
          </button>
        </div>
      </section>

      {staffError && (
        <div className="mb-6 border border-error/30 bg-red-50 px-4 py-3 text-sm text-error">
          Staff list issue: {staffError}
        </div>
      )}

      {error && (
        <div className="mb-6 border border-error/30 bg-red-50 px-4 py-3 text-sm text-error flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={clearHotelError}
            className="text-xs uppercase tracking-widest font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-16">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-outline/20 text-on-surface-variant">
          No hotels found for the current criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
              const managerName =
                typeof hotel.manager === "object" ? hotel.manager?.name || "Not assigned" : "Not assigned";
              const receptionistCount = Array.isArray(hotel.receptionists)
                ? hotel.receptionists.length
                : 0;

              return (
                <article
                  key={hotel._id}
                  className="bg-surface border border-outline/20 p-6 shadow-sm hover:border-primary/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-headline font-semibold tracking-tight text-on-surface">
                      {hotel.name}
                    </h3>
                    <span className="material-symbols-outlined text-primary">apartment</span>
                  </div>

                  <p className="mt-3 text-sm text-on-surface-variant min-h-10">
                    {hotel.location?.address || "Address not set"}
                  </p>

                  <div className="mt-5 space-y-2 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                    <div className="flex items-center justify-between gap-3">
                      <span>Manager</span>
                      <span className="text-on-surface font-bold normal-case tracking-normal text-sm">
                        {managerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Receptionists</span>
                      <span className="text-on-surface font-bold">{receptionistCount}</span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-outline/20 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-3">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-2 min-h-7">
                      {(hotel.amenities || []).slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider border border-outline/30 text-on-surface-variant bg-surface-container"
                        >
                          {amenity}
                        </span>
                      ))}
                      {(!hotel.amenities || hotel.amenities.length === 0) && (
                        <span className="text-xs text-on-surface-variant italic">No amenities listed</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-outline/20 pt-4 flex items-center justify-between">
                    <div className="text-xs text-on-surface-variant">
                      {(hotel.phone || []).length > 0 ? hotel.phone[0] : "No contact"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(hotel)}
                        className="w-9 h-9 border border-outline/25 text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                        title="Edit hotel"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteDialog(hotel)}
                        className="w-9 h-9 border border-outline/25 text-on-surface-variant hover:text-error hover:border-error transition-colors flex items-center justify-center"
                        title="Delete hotel"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {pagination && pagination.pages > 1 && (
            <footer className="mt-12 pt-8 border-t border-outline/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <p>
                Showing {(currentPage - 1) * PAGE_LIMIT + 1} to {Math.min(currentPage * PAGE_LIMIT, totalHotels)} of {totalHotels} hotels
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 border border-outline/25 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-outline/25 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 h-8 border text-xs transition-colors ${
                      pageNumber === currentPage
                        ? "bg-primary border-primary text-white"
                        : "border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="w-8 h-8 border border-outline/25 flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-outline/25 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </footer>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto w-full p-4 md:p-6 z-50">
          <div className="min-h-full flex items-start justify-center">
            <div className="relative bg-surface w-full max-w-5xl border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.35)] p-6 md:p-8 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto my-2">
            <div className="flex items-center justify-between pb-4 border-b border-outline/20 mb-8">
              <h3 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
                {modalMode === "create" ? "Create Hotel" : "Edit Hotel"}
              </h3>
              <button
                onClick={closeModal}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Hotel Name
                  </label>
                  <input
                    required
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Patha Yatri Grand"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Manager
                  </label>
                  {availableManagers.length === 0 && (
                    <p className="mb-2 text-xs text-on-surface-variant italic">
                      {modalMode === "create"
                        ? "No available managers. Only active unassigned managers are listed."
                        : "No available managers. Only active unassigned managers or managers already assigned to this hotel are listed."}
                    </p>
                  )}
                  <select
                    required
                    value={formState.manager}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, manager: event.target.value }))
                    }
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    disabled={isStaffLoading}
                  >
                    <option value="">Select manager</option>
                    {availableManagers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Address
                  </label>
                  <input
                    required
                    value={formState.locationAddress}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, locationAddress: event.target.value }))
                    }
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Street, city, state"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Map Location
                  </label>
                  <input
                    value={formState.locationMapLocation}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, locationMapLocation: event.target.value }))
                    }
                    className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Map pin / URL"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Location Description
                </label>
                <textarea
                  rows="3"
                  value={formState.locationDescription}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, locationDescription: event.target.value }))
                  }
                  className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary resize-none"
                  placeholder="Neighborhood highlights and context"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Receptionists
                  </label>
                  <div className="border border-outline/20 bg-surface-container p-3 max-h-40 overflow-y-auto space-y-2">
                    {availableReceptionists.length === 0 && (
                      <p className="text-sm text-on-surface-variant italic">
                        {modalMode === "create"
                          ? "No available receptionists found. Only active unassigned receptionists are listed."
                          : "No available receptionists found. Only active unassigned receptionists or receptionists already assigned to this hotel are listed."}
                      </p>
                    )}
                    {availableReceptionists.map((staff) => {
                      const checked = formState.receptionists.includes(staff._id);
                      return (
                        <label key={staff._id} className="flex items-center gap-3 text-sm text-on-surface">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleReceptionist(staff._id)}
                            className="accent-primary"
                          />
                          <span>{staff.name}</span>
                          <span className="text-xs text-on-surface-variant">({staff.email})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Website
                    </label>
                    <input
                      value={formState.website}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, website: event.target.value }))
                      }
                      className="w-full bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Proximity (km)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        min="0"
                        value={formState.proximityAirport}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, proximityAirport: event.target.value }))
                        }
                        className="bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="Airport"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formState.proximityBusStation}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, proximityBusStation: event.target.value }))
                        }
                        className="bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="Bus"
                      />
                      <input
                        type="number"
                        min="0"
                        value={formState.proximityTrainStation}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, proximityTrainStation: event.target.value }))
                        }
                        className="bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="Train"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Amenities
                  </label>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs text-on-surface-variant">Select from approved amenities list</p>
                    {formState.amenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, amenities: [] }))}
                        className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant hover:text-error"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="border border-outline/20 bg-surface-container p-3 max-h-40 overflow-y-auto space-y-2">
                    {AMENITY_OPTIONS.map((amenity) => {
                      const checked = formState.amenities.includes(amenity);
                      return (
                        <label key={amenity} className="flex items-center gap-3 text-sm text-on-surface">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAmenity(amenity)}
                            className="accent-primary"
                          />
                          <span>{amenity}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 min-h-7">
                    {formState.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-2 px-2 py-1 bg-surface border border-outline/25 text-xs text-on-surface"
                      >
                        {amenity}
                        <button type="button" onClick={() => toggleAmenity(amenity)}>
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Phone Numbers
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addPhone();
                        }
                      }}
                      className="flex-1 bg-surface-container border border-outline/20 p-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="Add phone"
                    />
                    <button
                      type="button"
                      onClick={addPhone}
                      className="px-4 border border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 min-h-7">
                    {formState.phone.map((phone) => (
                      <span
                        key={phone}
                        className="inline-flex items-center gap-2 px-2 py-1 bg-surface border border-outline/25 text-xs text-on-surface"
                      >
                        {phone}
                        <button type="button" onClick={() => removePhone(phone)}>
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Photos (max 5)
                </label>

                {formState.existingPhotos.length > 0 && (
                  <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formState.existingPhotos.map((photoUrl) => (
                      <div
                        key={photoUrl}
                        className="flex items-center justify-between gap-3 border border-outline/20 bg-surface-container p-2"
                      >
                        <a
                          href={photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-on-surface truncate hover:text-primary"
                        >
                          {photoUrl}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photoUrl)}
                          className="text-on-surface-variant hover:text-error"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-dashed border-outline/35 bg-surface-container px-4 py-6 text-center relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelection}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  <p className="text-sm text-on-surface mt-2">Drop images or click to select files</p>
                  <p className="text-xs text-on-surface-variant mt-1">New uploads are appended to retained photos.</p>
                </div>

                {formState.newPhotos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formState.newPhotos.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-3 border border-outline/20 bg-surface-container p-2"
                      >
                        <span className="text-xs text-on-surface truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="text-on-surface-variant hover:text-error"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-outline/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant border border-outline/25 hover:border-outline/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isStaffLoading}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest bg-primary text-white border border-primary hover:bg-primary-container hover:border-primary-container transition-colors disabled:opacity-60"
                >
                  {modalMode === "create" ? "Create Hotel" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-surface border border-outline/25 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-3xl mt-1">warning</span>
              <div>
                <h4 className="text-2xl font-headline font-semibold text-on-surface">Delete Hotel</h4>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  Delete <strong className="text-on-surface">{hotelToDelete?.name}</strong>? This permanently removes the hotel and attempts cascade cleanup of linked rooms and bookings.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 border border-error/30 bg-red-50 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setHotelToDelete(null);
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-outline/25 text-on-surface-variant hover:border-outline/60"
              >
                Keep Hotel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-error text-error hover:bg-error hover:text-white transition-colors disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagement;
