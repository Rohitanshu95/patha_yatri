import React, { useState } from 'react';

export default function AddServiceModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('food');
  const [selectedServices, setSelectedServices] = useState({
    'dinner-buffet': 2,
    'late-night-snacks': 1,
  });

  const services = {
    food: [
      { id: 'dinner-buffet', name: 'Dinner Buffet', desc: 'Premium Dining Service — ₹450' },
      { id: 'breakfast-bed', name: 'Breakfast in Bed', desc: 'Signature morning delivery — ₹300' },
      { id: 'minibar', name: 'Minibar Auto-charge', desc: 'Standard restock — ₹150' },
      { id: 'late-night-snacks', name: 'Late Night Snacks', desc: 'Service available till 3 AM — ₹250' },
    ],
    laundry: [],
    spa: [],
    transport: [],
    other: [],
  };

  const tabs = [
    { id: 'food', label: 'Food & Beverage' },
    { id: 'laundry', label: 'Laundry' },
    { id: 'spa', label: 'Spa & Wellness' },
    { id: 'transport', label: 'Transport' },
    { id: 'other', label: 'Other' },
  ];

  const updateQuantity = (serviceId, delta) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: Math.max(0, (prev[serviceId] || 0) + delta),
    }));
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] ? 0 : 1,
    }));
  };

  const totalAmount = Object.entries(selectedServices).reduce((sum, [id, qty]) => {
    const prices = { 'dinner-buffet': 450, 'breakfast-bed': 300, 'minibar': 150, 'late-night-snacks': 250 };
    return sum + ((prices[id] || 0) * qty);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#222222]/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[620px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#D1C5B4]/20 overflow-hidden flex flex-col max-h-[921px]">
        {/* Header */}
        <div className="px-10 pt-10 pb-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-bold font-headline text-[#222222] tracking-normal italic">Add Room Service &amp; Extras</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-[#777777] hover:text-[#C5A059] transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          <p className="text-[#777777] text-xs font-semibold tracking-widest uppercase">
            Folio: <span className="text-[#C5A059]">PY-2026-0087</span> | Room 302 — Amit Kumar
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Category Tabs */}
          <div className="px-10 mb-8 overflow-x-auto">
            <div className="flex gap-4 min-w-max border-b border-[#D1C5B4]/10">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 border-b-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab.id
                      ? 'border-[#C5A059] text-[#222222]'
                      : 'border-transparent text-[#777777] hover:text-[#222222]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Container */}
          <div className="px-10 flex-1 overflow-hidden">
            <div className="bg-[#F8F9FA] h-full flex flex-col border border-[#D1C5B4]/15">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {services[activeTab].map(service => (
                  <div
                    key={service.id}
                    className={`group flex items-center justify-between p-5 transition-all ${
                      selectedServices[service.id]
                        ? 'bg-white border border-[#C5A059]/30 shadow-sm'
                        : 'bg-transparent border border-transparent hover:border-[#D1C5B4]/30'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => toggleService(service.id)}
                        className="w-6 h-6 flex items-center justify-center border transition-colors"
                        style={{
                          borderColor: selectedServices[service.id] ? '#C5A059' : '#D1C5B4',
                          backgroundColor: selectedServices[service.id] ? '#C5A059' : 'transparent',
                          color: selectedServices[service.id] ? 'white' : 'transparent',
                        }}
                      >
                        {selectedServices[service.id] && (
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                        )}
                      </button>
                      <div>
                        <h4 className="font-bold text-[#222222] text-sm uppercase tracking-wider">{service.name}</h4>
                        <p className="text-[11px] text-[#777777] mt-0.5">{service.desc}</p>
                      </div>
                    </div>
                    {selectedServices[service.id] > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[#D1C5B4]/30 bg-white">
                          <button
                            onClick={() => updateQuantity(service.id, -1)}
                            className="w-9 h-9 flex items-center justify-center text-[#777777] hover:text-[#C5A059] transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <span className="w-10 text-center font-bold text-[#C5A059]">{selectedServices[service.id]}</span>
                          <button
                            onClick={() => updateQuantity(service.id, 1)}
                            className="w-9 h-9 flex items-center justify-center text-[#777777] hover:text-[#C5A059] transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Item Link */}
          <div className="px-10 py-8">
            <button className="group flex items-center gap-3 text-[#C5A059] hover:text-[#222222] transition-colors">
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span className="text-[11px] font-bold uppercase tracking-widest border-b border-[#C5A059]/30 group-hover:border-[#222222]/60 transition-all">Add custom charge not listed</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-[#F8F9FA] border-t border-[#D1C5B4]/15 flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-[#777777] font-bold mb-1">Total Estimated</span>
            <span className="text-3xl font-bold font-headline text-[#222222]">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex gap-6 items-center">
            <button
              onClick={onClose}
              className="text-[10px] uppercase tracking-widest text-[#777777] hover:text-[#222222] font-bold transition-colors"
            >
              Cancel
            </button>
            <button className="px-10 py-4 bg-[#C5A059] text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C5A059]/10 flex items-center gap-3 hover:bg-[#B38D45] active:scale-95 transition-all">
              Add to Bill
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
