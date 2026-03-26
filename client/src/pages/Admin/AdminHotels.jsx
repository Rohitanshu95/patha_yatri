import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const defaultHotelImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070";

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    manager: "",
    website: "",
    map_location: "",
    roomsAvailable: "",
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchHotels();
    fetchManagers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/hotels?limit=50");
      if (res.data.success) {
        setHotels(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/users?role=manager&limit=100", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setManagers(res.data.data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch managers", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.manager) {
      toast.error("Name, Address, and Manager are required");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("manager", formData.manager);
      form.append("website", formData.website);
      
      form.append("location", JSON.stringify({
        address: formData.address,
        description: formData.description,
        map_location: formData.map_location
      }));

      if (formData.roomsAvailable) {
        form.append("roomsAvailable", formData.roomsAvailable);
      }

      photoFiles.forEach(file => {
        form.append("photos", file);
      });

      const res = await axios.post("http://localhost:5000/api/v1/hotels", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (res.data.success) {
        toast.success("Property initialized successfully");
        setIsModalOpen(false);
        setFormData({ name: "", address: "", description: "", manager: "", website: "", map_location: "", roomsAvailable: "" });
        setPhotoFiles([]);
        fetchHotels();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create property");
    }
  };

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    h.location?.address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="min-h-full font-body text-on-surface">
      {/* Page Header Section */}
      <section className="flex justify-between items-end mb-12 relative z-10 w-full overflow-hidden">
        <div>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Luxury Properties</h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <p className="text-on-surface-variant text-sm font-medium">Managing {hotels.length} premium locations</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-sm border border-outline/15">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant outline-none" 
              placeholder="Search properties..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-neutral-900 text-white border border-neutral-900 font-bold px-8 py-3 rounded-sm flex items-center gap-3 hover:bg-primary hover:border-primary transition-all uppercase text-xs tracking-widest flex-shrink-0 shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add New Property</span>
          </button>
        </div>
      </section>

      {/* Filter Row */}
      <section className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-6 border-b border-outline/15">
        <div className="flex items-center gap-8">
          <button className="text-sm pb-1 font-semibold text-on-surface border-b-2 border-primary -mb-[3px]">
            All Properties
          </button>
        </div>
      </section>

      {/* Hotel Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-outline/10 text-on-surface-variant">
          No properties found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
          {filteredHotels.map(hotel => {
            const heroImage = hotel.photos && hotel.photos.length > 0 ? hotel.photos[0] : defaultHotelImage;

            return (
              <div key={hotel._id} className="luxury-card group bg-surface overflow-hidden flex flex-col border border-outline/15 rounded-sm shadow-sm">
                <div className="h-56 w-full relative overflow-hidden">
                  <img 
                    alt={hotel.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={heroImage} 
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-primary text-white shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-widest">{hotel.rooms?.length || 0} ROOMS</span>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-sm bg-white/90 text-on-surface-variant backdrop-blur-sm border border-outline/30">
                    <span className="text-[9px] font-bold uppercase tracking-widest">{hotel.photos?.length || 0} ASSETS</span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-headline font-bold text-on-surface">{hotel.name}</h3>
                  </div>
                  <p className="text-on-surface-variant font-medium text-[11px] mb-6 uppercase tracking-wider line-clamp-2">
                    {hotel.location?.address}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-outline/15 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>{hotel.manager?.name || "UNASSIGNED"}</span>
                    </div>

                    <div className="flex gap-4">
                      <button className="text-on-surface-variant hover:text-primary transition-colors" title="Manage Property">
                        <span className="material-symbols-outlined text-xl">settings</span>
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
      )}

      {/* Modal Re-styled to Gold Slate Minimal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative p-10 bg-surface w-full max-w-2xl m-auto border border-outline/20 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center mb-8 border-b border-section-divide pb-4">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Initialize New Property</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Property Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="e.g. The Grand Plaza" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Physical Location *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="e.g. 123 Main St, Mumbai" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Location Strategy / Directions</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Resident Manager *</label>
                  <select name="manager" required value={formData.manager} onChange={handleChange} className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Select a manager</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Initial Room Gen</label>
                  <input type="number" name="roomsAvailable" value={formData.roomsAvailable} onChange={handleChange} min="0" max="500" className="w-full bg-surface-container border border-outline/15 rounded-sm p-3 text-sm text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="e.g. 50" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Visual Assets</label>
                <div className="border border-dashed border-outline/30 bg-surface-container p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative rounded-sm group">
                  <input type="file" name="images" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-primary text-3xl mb-2 block group-hover:scale-110 transition-transform">cloud_upload</span>
                  <p className="text-xs text-on-surface font-medium">Drag & drop high-res visuals here, or click to browse</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">JPEG, PNG up to 10MB</p>
                  {photoFiles.length > 0 && (
                    <p className="mt-2 text-[10px] font-bold text-primary uppercase">{photoFiles.length} file(s) queued</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-section-divide flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container transition-colors rounded-sm">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-white border border-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors rounded-sm shadow-md hover:shadow-lg">
                  Initialize Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
