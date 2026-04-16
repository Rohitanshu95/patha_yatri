import React, { useEffect, useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import useAuthStore from "../../store/authStore";
import { useHotelStore } from "../../store/hotelStore";
import { showError } from "../../utils/toast";

const statusConfig = {
  available: {
    label: "Available",
    badgeClass: "bg-primary text-white shadow-sm",
    imageClass: "",
    icon: "check_circle",
    iconColor: "text-primary",
    actionColor: "text-primary",
    statusText: "Ready for Check-in"
  },
  occupied: {
    label: "Occupied",
    badgeClass: "bg-white/90 text-on-surface-variant backdrop-blur-sm border border-outline/30",
    imageClass: "",
    icon: "person",
    iconColor: "text-primary",
    actionColor: "text-on-surface-variant",
    statusText: "In Residence"
  },
  maintenance: {
    label: "Maintenance",
    badgeClass: "bg-on-surface text-primary",
    imageClass: "grayscale opacity-80",
    icon: "engineering",
    iconColor: "text-primary",
    actionColor: "text-on-surface",
    statusText: "Service Required"
  }
};

const categoryConfig = {
  standard: "bg-white/90 text-on-surface-variant backdrop-blur-sm border border-outline/30",
  deluxe: "bg-white/90 text-on-surface-variant backdrop-blur-sm border border-outline/30",
  suite: "bg-primary text-white"
};

const defaultRoomImage = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop";

const getEmptyRoomForm = (hotel = "") => ({
  room_number: "",
  name: "",
  room_category: "standard",
  availability: "available",
  price_per_night: "",
  tax_percent: "",
  max_occupants: 2,
  hotel,
  images: null,
});

const RoomManagement = () => {
  const { rooms, pagination, isLoading, fetchRooms, createRoom } = useRoomStore();
  const { hotels: hotelOptions, fetchHotels } = useHotelStore();
  const authUser = useAuthStore((state) => state.user);
  const isAdmin = authUser?.role === "admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState("all");
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Blueprint shows 6 per page

  // Form State
  const [formData, setFormData] = useState(getEmptyRoomForm());

  useEffect(() => {
    if (!isAdmin) return;

    fetchHotels({ page: 1, limit: 200 });
  }, [isAdmin, fetchHotels]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when filters or pagination change
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      category: categoryFilter,
      status: statusFilter,
    };

    if (isAdmin && selectedHotel !== "all") {
      filters.hotel = selectedHotel;
    }

    fetchRooms(filters);
  }, [
    fetchRooms,
    currentPage,
    debouncedSearch,
    categoryFilter,
    statusFilter,
    isAdmin,
    selectedHotel,
  ]);

  const handleChange = (e) => {
    // ... logic remains the same
    if (e.target.name === "images") {
      setFormData({ ...formData, images: e.target.files });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    // ... logic remains the same
    e.preventDefault();
    const data = new FormData();

    if (isAdmin) {
      const hotelToAssign = formData.hotel || (selectedHotel !== "all" ? selectedHotel : "");
      if (!hotelToAssign) {
        showError(null, "Please select a hotel before creating a room");
        return;
      }
      data.append("hotel", hotelToAssign);
    }

    data.append("room_number", formData.room_number);
    data.append("name", formData.name);
    data.append("room_category", formData.room_category);
    data.append("availability", formData.availability);
    data.append("price_per_night", formData.price_per_night);
    data.append("tax_percent", formData.tax_percent);
    data.append("max_occupants", formData.max_occupants);
    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }

    const success = await createRoom(data);
    if (success) {
      setIsModalOpen(false);
      setFormData(getEmptyRoomForm(isAdmin && selectedHotel !== "all" ? selectedHotel : ""));
      // Refresh current page
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
      };

      if (isAdmin && selectedHotel !== "all") {
        filters.hotel = selectedHotel;
      }

      fetchRooms(filters);
    }
  };

  const openCreateModal = () => {
    if (isAdmin && hotelOptions.length === 0) {
      showError(null, "Create at least one hotel before adding rooms");
      return;
    }

    setFormData(getEmptyRoomForm(isAdmin && selectedHotel !== "all" ? selectedHotel : ""));
    setIsModalOpen(true);
  };

  // Status counts logic is slightly tricky since the backend returns paginated data.
  // Ideally, total counts should come from a stats endpoint.
  // We'll rely on the global pagination.total for now to represent the "All Inventory" count matching current filters.
  const totalRooms = pagination?.total || 0;

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (pagination?.pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-full font-body text-on-surface">
      {/* Page Header Section */}
      <section className="flex justify-between items-end mb-12 relative z-10 w-full overflow-hidden">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Luxury Accommodations</h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <p className="text-on-surface-variant text-sm font-medium">Managing {totalRooms} premium guest suites</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          {/* Page-level Search */}
          <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-sm border border-outline/15">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant outline-none" 
              placeholder="Search rooms..." 
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-sm border border-outline/15 min-w-56">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">apartment</span>
              <select
                value={selectedHotel}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedHotel(value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface outline-none cursor-pointer"
              >
                <option value="all">All Hotels</option>
                {hotelOptions.map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={openCreateModal}
            className="bg-neutral-900 text-white border border-neutral-900 font-bold px-8 py-3 rounded-sm flex items-center gap-3 hover:bg-primary hover:border-primary transition-all uppercase text-xs tracking-widest shrink-0 shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add New Suite</span>
          </button>
        </div>
      </section>

      {/* Filter Row */}
      <section className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-6 border-b border-outline/15">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
            className={`text-sm pb-1 ${statusFilter === "all" ? "font-semibold text-on-surface border-b-2 border-primary -mb-0.75" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
          >
            All Inventory
          </button>
          <button 
            onClick={() => { setStatusFilter("available"); setCurrentPage(1); }}
            className={`text-sm pb-1 ${statusFilter === "available" ? "font-semibold text-on-surface border-b-2 border-primary -mb-0.75" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
          >
            Available
          </button>
          <button 
            onClick={() => { setStatusFilter("occupied"); setCurrentPage(1); }}
            className={`text-sm pb-1 ${statusFilter === "occupied" ? "font-semibold text-on-surface border-b-2 border-primary -mb-0.75" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
          >
            Occupied
          </button>
          <button 
            onClick={() => { setStatusFilter("maintenance"); setCurrentPage(1); }}
            className={`text-sm pb-1 ${statusFilter === "maintenance" ? "font-semibold text-on-surface border-b-2 border-primary -mb-0.75" : "font-medium text-on-surface-variant hover:text-primary transition-colors"}`}
          >
            Maintenance
          </button>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Filter Category:</span>
          <div className="flex gap-4">
            <button 
              onClick={() => { setCategoryFilter(categoryFilter === "standard" ? "all" : "standard"); setCurrentPage(1); }}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${categoryFilter === "standard" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              Standard
            </button>
            <button 
              onClick={() => { setCategoryFilter(categoryFilter === "deluxe" ? "all" : "deluxe"); setCurrentPage(1); }}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${categoryFilter === "deluxe" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              Deluxe
            </button>
            <button 
              onClick={() => { setCategoryFilter(categoryFilter === "suite" ? "all" : "suite"); setCurrentPage(1); }}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${categoryFilter === "suite" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              Suites
            </button>
          </div>
        </div>
      </section>

      {/* Room Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-outline/10 text-on-surface-variant">
          No rooms found matching your criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
            {rooms.map((room) => {
              const status = statusConfig[room.availability?.toLowerCase()] || statusConfig.available;
              const categoryBadge = categoryConfig[room.room_category?.toLowerCase()] || categoryConfig.standard;
              const heroImage = room.images && room.images.length > 0 ? room.images[0] : defaultRoomImage;

              return (
                <div key={room._id} className="luxury-card group bg-surface overflow-hidden flex flex-col border border-outline/15 rounded-sm shadow-sm">
                  <div className={`h-56 w-full relative overflow-hidden ${room.availability === 'maintenance' ? 'grayscale opacity-80' : ''}`}>
                    <img 
                      alt={`Room ${room.room_number}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={heroImage} 
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-sm ${status.badgeClass} shadow-sm`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest">{status.label}</span>
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-sm ${categoryBadge}`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest">{room.room_category}</span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-headline font-bold text-on-surface">Room {room.room_number}</h3>
                      <div className="flex gap-3 text-primary">
                        <span className="material-symbols-outlined text-lg">wifi</span>
                        <span className="material-symbols-outlined text-lg">ac_unit</span>
                      </div>
                    </div>
                    <p className="text-on-surface-variant font-medium text-[11px] mb-6 uppercase tracking-wider">{room.name}</p>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className={`text-2xl font-headline font-bold ${room.availability === 'maintenance' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                        ₹{room.price?.per_night || 0}
                      </span>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">/ Nightly</span>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-outline/15 flex items-center justify-between">
                      {room.availability === 'occupied' && room.currentGuestName ? (
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase font-semibold">
                          <span className="material-symbols-outlined text-sm text-primary">person</span>
                          <span>{room.currentGuestName}</span>
                        </div>
                      ) : room.availability === 'maintenance' ? (
                        <div className="flex items-center gap-2 text-[10px] text-on-surface font-semibold italic">
                          <span className="material-symbols-outlined text-sm text-primary">engineering</span>
                          <span>Service Required</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest">
                          <span className={`material-symbols-outlined text-sm`}>{status.icon}</span>
                          <span>{status.statusText}</span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button className="text-on-surface-variant hover:text-primary transition-colors" title="Edit Master Record">
                          <span className="material-symbols-outlined text-xl">edit_note</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-primary transition-colors" title="View Details">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <footer className="mt-16 pt-8 border-t border-section-divide flex justify-between items-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              <p>Displaying {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} Premium Suites</p>
              
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-outline/15 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline/15 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                {[...Array(pagination.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center transition-all ${
                        currentPage === pageNum 
                          ? 'bg-primary text-white border-primary' 
                          : 'border border-outline/15 hover:border-primary hover:text-primary text-on-surface-variant'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="w-8 h-8 flex items-center justify-center border border-outline/15 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline/15 disabled:hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </footer>
          )}
        </>
      )}

      {/* Modal Re-styled to Gold Slate Minimal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative p-10 bg-surface w-full max-w-2xl m-auto border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center mb-8 border-b border-section-divide pb-4">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Add New Suite</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Assign Hotel</label>
                  <select
                    name="hotel"
                    required
                    value={formData.hotel}
                    onChange={handleChange}
                    className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select hotel</option>
                    {hotelOptions.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Room Identifier</label>
                  <input type="text" name="room_number" required value={formData.room_number} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="e.g. 501" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Marketing Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="e.g. Presidential Suite" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Suite Tier</label>
                  <select name="room_category" value={formData.room_category} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all appearance-none cursor-pointer">
                    <option value="standard">Standard Level</option>
                    <option value="deluxe">Deluxe Premium</option>
                    <option value="suite">Executive Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Initial Status</label>
                  <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all appearance-none cursor-pointer">
                    <option value="available">Ready for Occupation</option>
                    <option value="occupied">Currently Assigned</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Base Tariff (₹)</label>
                  <input type="number" name="price_per_night" required value={formData.price_per_night} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="10500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tax Levy (%)</label>
                  <input type="number" name="tax_percent" required value={formData.tax_percent} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="18" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Capacity</label>
                  <input type="number" name="max_occupants" required value={formData.max_occupants} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" min="1" max="10"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Visual Assets</label>
                <div className="border border-dashed border-outline/30 bg-surface-container p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative rounded-sm group">
                  <input type="file" name="images" multiple onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-primary text-3xl mb-2 block group-hover:scale-110 transition-transform">cloud_upload</span>
                  <p className="text-xs text-on-surface font-medium">Drag & drop high-res visuals here, or click to browse</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">JPEG, PNG up to 10MB</p>
                </div>
              </div>

              <div className="pt-6 border-t border-section-divide flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors rounded-sm">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-white border border-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors rounded-sm shadow-md hover:shadow-lg">
                  Initialize Master Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;