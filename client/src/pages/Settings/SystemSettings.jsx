import React, { useState } from 'react';

export default function SystemSettings() {
  const [formData, setFormData] = useState({
    hotelName: 'Patha Yatri Hotel',
    legalEntityName: 'Patha Yatri Hospitality Pvt. Ltd.',
    hotelEmail: 'concierge@pathayatri.com',
    contactPhone: '+91 98765 43210',
    fullAddress: '123 Luxury Lane, Bhubaneswar, Odisha',
    gstinNumber: '21AAAAA0000A1Z5',
    accentColor: '#C5A059',
    activeTab: 'hotelProfile',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (e) => {
    setFormData(prev => ({
      ...prev,
      accentColor: e.target.value,
    }));
  };

  const settingsTabs = [
    { id: 'hotelProfile', icon: 'hotel', label: 'Hotel Profile' },
    { id: 'taxGst', icon: 'receipt_long', label: 'Tax & GST Configuration' },
    { id: 'roomCategories', icon: 'meeting_room', label: 'Room Categories' },
    { id: 'pricingRules', icon: 'sell', label: 'Pricing Rules' },
    { id: 'userRoles', icon: 'admin_panel_settings', label: 'User Roles & Permissions' },
    { id: 'emailSms', icon: 'mail', label: 'Email / SMS Gateways' },
  ];

  return (
    <div className="pt-28 pb-12 px-8 flex gap-8">
      {/* Left Sidebar (Inner Nav) */}
      <div className="w-72 shrink-0">
        <nav className="bg-section-divide rounded-2xl overflow-hidden border border-border-soft/15">
          <div className="p-2 space-y-1">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFormData(prev => ({ ...prev, activeTab: tab.id }))}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  formData.activeTab === tab.id
                    ? 'bg-white text-deep-neutral font-semibold border border-primary-accent/20 shadow-sm'
                    : 'text-secondary-text hover:bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined mr-3" data-icon={tab.icon}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Right Content Area (Forms) */}
      <div className="flex-1 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 border border-border-soft/20 shadow-sm">
          <div className="mb-8">
            <h3 className="text-3xl font-headline text-deep-neutral">Hotel Information</h3>
            <p className="text-secondary-text mt-1 text-sm">Update your property details, contact info, and branding.</p>
          </div>

          {/* Subtle Divider */}
          <div className="h-px bg-border-soft/10 mb-8"></div>

          {/* Two-column form grid */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Hotel Name</label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                className="w-full bg-section-divide border-border-soft/20 rounded-xl px-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all placeholder:text-secondary-text/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Legal Entity Name</label>
              <input
                type="text"
                name="legalEntityName"
                value={formData.legalEntityName}
                onChange={handleInputChange}
                className="w-full bg-section-divide border-border-soft/20 rounded-xl px-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all placeholder:text-secondary-text/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Hotel Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text/60 text-sm" data-icon="alternate_email">
                  alternate_email
                </span>
                <input
                  type="email"
                  name="hotelEmail"
                  value={formData.hotelEmail}
                  onChange={handleInputChange}
                  placeholder="concierge@pathayatri.com"
                  className="w-full bg-section-divide border-border-soft/20 rounded-xl pl-11 pr-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Contact Phone</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text/60 text-sm" data-icon="call">
                  call
                </span>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-section-divide border-border-soft/20 rounded-xl pl-11 pr-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Full Address</label>
              <textarea
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-section-divide border-border-soft/20 rounded-xl px-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">GSTIN Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="gstinNumber"
                  value={formData.gstinNumber}
                  onChange={handleInputChange}
                  className="w-full bg-section-divide border-border-soft/20 rounded-xl px-4 py-3 text-deep-neutral focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="mb-10">
            <h4 className="text-xl font-headline text-deep-neutral mb-6">Branding & Assets</h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Hotel Logo Dark</label>
                <div className="border-2 border-dashed border-border-soft/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-section-divide hover:bg-[#EDEEEF] transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="text-primary-accent font-black text-xl font-headline">PY</span>
                  </div>
                  <span className="material-symbols-outlined text-secondary-text mb-2" data-icon="cloud_upload">
                    cloud_upload
                  </span>
                  <p className="text-xs text-secondary-text text-center">
                    Drag &amp; drop dark logo or <span className="text-primary-accent underline">browse</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Hotel Logo Light</label>
                <div className="border-2 border-dashed border-border-soft/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-section-divide hover:bg-[#EDEEEF] transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl bg-deep-neutral flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="text-primary-accent font-black text-xl font-headline">PY</span>
                  </div>
                  <span className="material-symbols-outlined text-secondary-text mb-2" data-icon="cloud_upload">
                    cloud_upload
                  </span>
                  <p className="text-xs text-secondary-text text-center">
                    Drag &amp; drop light logo or <span className="text-primary-accent underline">browse</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="w-full max-w-xs space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-secondary-text font-label">Primary Accent Color</label>
                <div className="flex items-center gap-4 bg-section-divide rounded-xl p-2 px-4 border border-border-soft/20">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 p-0 overflow-hidden cursor-pointer"
                  />
                  <span className="text-sm font-mono text-deep-neutral">{formData.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="h-px bg-border-soft/10 mb-8"></div>
          <div className="flex justify-end gap-4">
            <button className="px-8 py-3 rounded-xl font-bold text-sm text-secondary-text hover:bg-section-divide transition-all">
              Cancel
            </button>
            <button className="bg-primary-accent text-white px-10 py-3 rounded-xl font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all active:scale-[0.99] shadow-sm">
              Update Profile
              <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
