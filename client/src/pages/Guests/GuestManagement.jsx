import React, { useEffect, useState } from "react";
import { useGuestStore } from "../../store/guestStore";

const GuestManagement = () => {
  const { guests, isLoading, fetchGuests, registerGuest } = useGuestStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All Guests");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    id_proof: "Aadhaar",
    document_number: "",
    occupants_children: 0,
    occupants_adults_male: 1,
    occupants_adults_female: 0,
    identityProof: null
  });

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleChange = (e) => {
    if (e.target.name === "identityProof") {
      setFormData({ ...formData, identityProof: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("contact", formData.contact);
    data.append("address", formData.address);
    data.append("id_proof", formData.id_proof);
    data.append("document_number", formData.document_number);
    data.append("occupants_children", formData.occupants_children);
    data.append("occupants_adults_male", formData.occupants_adults_male);
    data.append("occupants_adults_female", formData.occupants_adults_female);
    if (formData.identityProof) {
      data.append("id_proof_file", formData.identityProof);
    }

    const success = await registerGuest(data);
    if (success) {
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        contact: "",
        address: "",
        id_proof: "Aadhaar",
        document_number: "",
        occupants_children: 0,
        occupants_adults_male: 1,
        occupants_adults_female: 0,
        identityProof: null
      });
    }
  };


  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guest.contact.includes(searchQuery) ||
                          guest.document_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-white min-h-full">
      {/* Top Navigation Bar Component Style */}
      <header className="sticky top-0 z-30 w-full flex justify-between items-center px-8 h-20 bg-white/80 backdrop-blur-xl border-b border-[#D1C5B4]/15">
        <div className="flex items-center gap-12">
          <h2 className="text-xl font-serif text-[#222222] antialiased">Guest Directory</h2>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777777] text-lg group-focus-within:text-[#C5A059] transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, phone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F8F9FA] border-none rounded-none pl-10 pr-4 py-2 w-80 text-sm focus:ring-0 focus:bg-white border-b border-transparent focus:border-[#C5A059] transition-all placeholder:text-[#777777]/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-[#222222] text-white px-6 py-3 rounded-none font-medium text-xs tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-all duration-300"
          >
            <span>+ Register New Guest</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-10 space-y-10">
        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-[#D1C5B4]/20 pb-6">
          <div className="flex gap-8">
            {['All Guests', 'Recent Stays', 'VIP/Loyal', 'Blacklisted'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${
                  filter === item
                    ? 'text-[#222222] border-[#C5A059]'
                    : 'text-[#777777] hover:text-[#222222] border-transparent'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1C5B4]/40 text-[10px] font-bold uppercase tracking-widest text-[#222222] hover:border-[#C5A059] transition-colors">
              <span className="material-symbols-outlined text-base text-[#C5A059]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1C5B4]/40 text-[10px] font-bold uppercase tracking-widest text-[#222222] hover:border-[#C5A059] transition-colors">
              <span className="material-symbols-outlined text-base text-[#C5A059]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Guests Table Container */}
        <div className="bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#777777] text-[10px] uppercase tracking-[0.2em] font-bold border-y border-[#D1C5B4]/20">
                <th className="px-8 py-5">Guest Information</th>
                <th className="px-8 py-5">Contact Details</th>
                <th className="px-8 py-5">Identification</th>
                <th className="px-8 py-5 text-center">Occupants</th>
                <th className="px-8 py-5">Address</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1C5B4]/10">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[#777777] text-sm">
                    Loading guests...
                  </td>
                </tr>
              ) : filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[#777777] text-sm">
                    No guests matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest._id} className="group hover:bg-[#F8F9FA] transition-colors cursor-pointer bg-white">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none overflow-hidden bg-[#F8F9FA] border border-[#D1C5B4]/20 grayscale hover:grayscale-0 transition-all duration-500">
                          {guest.id_proof_url ? (
                             <img src={guest.id_proof_url} alt={guest.name} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center bg-[#EDEEEF] text-[#777777]">
                                <span className="material-symbols-outlined">person</span>
                             </div>
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-lg text-[#222222]">{guest.name}</p>
                          <p className="text-[10px] text-[#777777] uppercase tracking-widest">{guest.id_proof} Verified</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-[#222222]">{guest.contact}</p>
                      <p className="text-xs text-[#777777]">{guest.email || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-3 py-1 bg-[#F8F9FA] border border-[#D1C5B4]/30 text-[9px] font-bold uppercase tracking-widest text-[#777777]">
                          {guest.id_proof}
                        </span>
                        <span className="text-xs text-[#222222] mt-1">{guest.document_number}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-serif font-bold text-[#222222]">
                          {(guest.occupants_adults_male || 0) + (guest.occupants_adults_female || 0) + (guest.occupants_children || 0)} Total
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                          M:{guest.occupants_adults_male} F:{guest.occupants_adults_female} C:{guest.occupants_children}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-[#222222]">{guest.address || 'Address not provided'}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#777777] hover:text-[#C5A059] transition-colors" title="View details">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button className="p-2 text-[#777777] hover:text-[#222222] transition-colors" title="Edit Guest">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl animate-slide-in-right flex flex-col pt-20">
            <div className="px-10 py-8 border-b border-[#D1C5B4]/20 flex justify-between items-center bg-[#F8F9FA]">
              <div>
                <h3 className="text-2xl font-serif text-[#222222]">Register New Guest</h3>
                <p className="text-xs text-[#777777] tracking-widest uppercase mt-2">Enter complete details for KYC</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#777777] hover:text-[#222222] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
              <form id="guest-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#D1C5B4]/20 pb-3 mb-6">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Contact *</label>
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                        placeholder="johndoe@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#D1C5B4]/20 pb-3 mb-6">
                    Identification Details
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">ID Proof Type</label>
                      <div className="relative">
                        <select
                          name="id_proof"
                          value={formData.id_proof}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all cursor-pointer"
                        >
                          <option value="Aadhaar">Aadhaar Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Document Number</label>
                      <input
                        type="text"
                        name="document_number"
                        value={formData.document_number}
                        onChange={handleChange}
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                        placeholder="ABCD12345XYZ"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Upload ID Scan</label>
                      <div className="relative border-2 border-dashed border-[#D1C5B4]/40 bg-[#F8F9FA] p-6 text-center hover:border-[#C5A059] transition-colors group cursor-pointer">
                        <input
                          type="file"
                          name="identityProof"
                          onChange={handleChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*,.pdf"
                        />
                        <span className="material-symbols-outlined text-4xl text-[#D1C5B4] group-hover:text-[#C5A059] transition-colors mb-2">cloud_upload</span>
                        <p className="text-sm text-[#222222] font-medium">Click or drag file here to upload</p>
                        <p className="text-xs text-[#777777] mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                        {formData.identityProof && (
                          <div className="mt-4 p-2 bg-white border border-[#C5A059]/30 text-xs text-[#C5A059] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {formData.identityProof.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Occupants Count Details */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#D1C5B4]/20 pb-3 mb-6">
                    Occupancy Details
                  </h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Adults (Male)</label>
                      <input
                        type="number"
                        name="occupants_adults_male"
                        value={formData.occupants_adults_male}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Adults (Female)</label>
                      <input
                        type="number"
                        name="occupants_adults_female"
                        value={formData.occupants_adults_female}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Children</label>
                      <input
                        type="number"
                        name="occupants_children"
                        value={formData.occupants_children}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-[#F8F9FA] border border-[#D1C5B4]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-8 border-t border-[#D1C5B4]/20 bg-[#F8F9FA] flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 border border-[#D1C5B4] text-[#222222] font-medium text-xs uppercase tracking-[0.15em] hover:bg-[#EDEEEF] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="guest-form"
                disabled={isLoading}
                className="px-8 py-3 bg-[#222222] text-white font-medium text-xs uppercase tracking-[0.15em] hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                   <>
                     <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                     Saving...
                   </>
                ) : (
                   <>Save Guest</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagement;
