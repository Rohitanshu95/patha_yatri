import React from 'react';
import { motion } from 'framer-motion';
import { Star, BedDouble, Monitor, Coffee, ArrowUp } from 'lucide-react';
import { hotels } from './mockData';

const HotelCard = ({ hotel, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full group border border-neutral-100/50"
    >
      <div className="relative w-full h-64 md:h-56 rounded-[1.5rem] overflow-hidden mb-5 bg-gray-100">
        <img 
          src={hotel.image} 
          alt={hotel.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
        />
        
        {/* Price Cutout shape */}
        <div className="absolute -top-1 -left-1 bg-white pr-5 pb-4 pt-4 pl-4 rounded-br-[2rem] z-10 flex text-[#b49a78] font-bold text-xl items-end gap-1">
          {hotel.price}
          <span className="text-xs font-normal text-[#94a3b8] mb-1">/Night</span>
        </div>
      </div>

      <div className="px-2 pb-2 mt-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-[#1e293b]">{hotel.name}</h3>
          <div className="flex items-center gap-1.5 text-[#94a3b8] text-sm font-semibold">
            <Star size={14} fill="#94a3b8" stroke="#94a3b8" />
            <span>{hotel.rating}</span>
          </div>
        </div>

        <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 line-clamp-2">
          At quis nullam duis sed aliquet faucibus. Sed diam pretium cum eget.
        </p>

        {/* Amenities */}
        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center text-xs text-[#64748B] font-medium">
          <div className="flex items-center gap-1.5 hover:text-[#b49a78] transition-colors cursor-default">
            <BedDouble size={16} strokeWidth={1.5} />
            <span>King Size Bed</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-[#b49a78] transition-colors cursor-default">
            <Monitor size={16} strokeWidth={1.5} />
            <span>32 Inc TV</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-[#b49a78] transition-colors cursor-default">
            <Coffee size={16} strokeWidth={1.5} />
            <span>Breakfast</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HotelShowcase = () => {
  return (
    <section id="hotels" className="py-20 bg-white relative z-20">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-[#F4F6F9] rounded-[3rem] p-8 md:p-12 lg:p-16 relative">
          
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#b49a78]" />
              <span className="text-[#475569] text-xs font-bold uppercase tracking-widest">Luxury Experience</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e293b] font-sans">
              Our Luxury Rooms
            </h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {hotels.map((hotel, idx) => (
              <HotelCard key={hotel.id} hotel={hotel} index={idx} />
            ))}
          </div>

          {/* Floating Scroll to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="absolute -bottom-6 right-8 lg:right-16 w-14 h-14 bg-[#a68c6a] hover:bg-[#8a7253] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:-translate-y-1 cursor-pointer z-30"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotelShowcase;
