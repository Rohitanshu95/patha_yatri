import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TestimonialsSection = () => {
  const { t } = useLanguage();
  const testimonials = t.testimonials.data;
  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get visible items (wrap around array)
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push(testimonials[(startIndex + i) % testimonials.length]);
    }
    return items;
  };

  return (
    <section className="py-24 bg-white relative z-20 overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 relative">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#b49a78]" />
              <span className="text-[#475569] text-xs font-bold uppercase tracking-widest">{t.testimonials.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e293b] font-serif">
              {t.testimonials.title}
            </h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-4">
            <button 
              onClick={prevSlide}
              className="w-14 h-14 rounded-2xl border border-neutral-200 flex items-center justify-center text-[#1e293b] hover:bg-[#212529] hover:text-white transition-all hover:shadow-xl hover:-translate-y-1"
              aria-label="Previous Testimonial"
            >
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <button 
              onClick={nextSlide}
              className="w-14 h-14 rounded-2xl border border-neutral-200 flex items-center justify-center text-[#1e293b] hover:bg-[#212529] hover:text-white transition-all hover:shadow-xl hover:-translate-y-1"
              aria-label="Next Testimonial"
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((testimonial, idx) => (
              <motion.div
                key={`${testimonial.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -30 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#F8F9FA] rounded-[2.5rem] p-8 shadow-sm border border-neutral-100 flex flex-col h-full group hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                {/* Quote text */}
                <div className="mb-8 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-[#b49a78]/20 font-serif leading-none">“</span>
                  <p className="text-[#475569] text-base leading-relaxed italic relative z-10 font-medium">
                    {testimonial.content}
                  </p>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-4 mb-8 mt-auto">
                  <div className="relative">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#b49a78] rounded-lg border-2 border-white flex items-center justify-center">
                      <ShieldCheck size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e293b] text-lg font-serif">{testimonial.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-bold uppercase tracking-wider">
                      <MapPin size={12} className="text-[#FF5722]" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Bottom Room Image with Overlay */}
                <div className="w-full h-44 rounded-[2rem] overflow-hidden relative group/img shadow-lg">
                  <img src={testimonial.roomImage} alt="Reviewed Stay" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">Verified Review</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
      </div>
    </section>
  );
};

// Simple icon components for the cards
const ShieldCheck = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const MapPin = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default TestimonialsSection;
