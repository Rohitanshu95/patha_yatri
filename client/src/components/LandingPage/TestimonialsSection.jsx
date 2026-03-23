import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const expandedTestimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "U.S.A",
    content: "Consistency is key, and this place nails it every time. Whether it's a quick lunch or a late-night snack, the quality is consistently outstanding and the services are spectacular.",
    avatar: "https://i.pravatar.cc/150?img=43",
    roomImage: "/assets/r1.png"
  },
  {
    id: 2,
    name: "Brian Clark",
    location: "Canada",
    content: "An absolute paradigm of luxury. The service was exceptional, making my stay not just comfortable but truly memorable. The views from the suite were breathtaking.",
    avatar: "https://i.pravatar.cc/150?img=11",
    roomImage: "/assets/r2.jpg"
  },
  {
    id: 3,
    name: "Megan Robinson",
    location: "Australia",
    content: "The aesthetic appeal of this hotel is breathtaking. Exaggerated minimalism executed flawlessly. I couldn't stop taking pictures of my suite.",
    avatar: "https://i.pravatar.cc/150?img=5",
    roomImage: "/assets/r3.jpg"
  },
  {
    id: 4,
    name: "Jonathan Hall",
    location: "United Kingdom",
    content: "Provided the perfect escape. The seamless blend of natural beauty and modern amenities is unparalleled. Unforgettable experience from start to finish.",
    avatar: "https://i.pravatar.cc/150?img=68",
    roomImage: "/assets/r5.jpg"
  }
];

const TestimonialsSection = () => {
  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % expandedTestimonials.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + expandedTestimonials.length) % expandedTestimonials.length);
  };

  // Get visible items (wrap around array)
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 4; i++) { // showing 4 identical to screenshot
      items.push(expandedTestimonials[(startIndex + i) % expandedTestimonials.length]);
    }
    return items;
  };

  return (
    <section className="py-24 bg-[#F4F6F9] relative z-20 overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 relative">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#b49a78]" />
              <span className="text-[#475569] text-xs font-bold uppercase tracking-widest">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e293b] font-sans">
              Satisfied Customers
            </h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-4">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-[1rem] border border-neutral-300 flex items-center justify-center text-[#1e293b] hover:bg-white transition-colors hover:shadow-sm"
              aria-label="Previous Testimonial"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-[1rem] border border-neutral-300 flex items-center justify-center text-[#1e293b] hover:bg-white transition-colors hover:shadow-sm"
              aria-label="Next Testimonial"
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((testimonial, idx) => (
              <motion.div
                key={`${testimonial.id}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 flex flex-col h-full"
              >
                {/* Quote text */}
                <p className="text-[#64748B] text-sm leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 mt-auto">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-neutral-100" />
                  <div>
                    <h4 className="font-bold text-[#1e293b] font-sans">{testimonial.name}</h4>
                    <span className="text-xs text-[#94a3b8]">{testimonial.location}</span>
                  </div>
                </div>

                {/* Bottom Room Image */}
                <div className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100">
                  <img src={testimonial.roomImage} alt="Reviewed Room" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
      </div>
    </section>
  );
};

export default TestimonialsSection;
