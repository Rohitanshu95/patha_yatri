import React from 'react';
import { motion } from 'framer-motion';
import { Plane, TrainFront, Bus, MapPin, Phone, Globe, Info, ArrowRight, ArrowUp, Star, BedDouble, Monitor, Coffee, UtensilsCrossed, Wind, ShieldCheck, Car } from 'lucide-react';
import { panthanivasData } from './mockData';
import { useLanguage } from '../../context/LanguageContext';

const PanthanivasCard = ({ item, index }) => {
  const { lang } = useLanguage();
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 border border-neutral-100 flex flex-col lg:flex-row gap-8 lg:gap-12 relative overflow-hidden group mb-10"
    >
      {/* 1. Left Section: Image */}
      <div className="w-full lg:w-[400px] h-[300px] lg:h-auto rounded-[2rem] overflow-hidden relative shadow-inner shrink-0 bg-neutral-100">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
        />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          4.5 Rating
        </div>
      </div>

      {/* 2. Middle Section: Content */}
      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-3 font-serif">
            {item.name}
          </h2>
          <div className="flex items-start gap-2 mb-4 text-[#FF5722] font-semibold text-base">
            <MapPin size={18} className="mt-0.5 shrink-0" />
            <p className="leading-tight">{item.address}</p>
          </div>
          
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-sm">
              <Phone size={16} />
              <span>{item.phone}</span>
            </div>
            <a 
              href={item.website} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 text-blue-500 font-semibold text-sm hover:underline decoration-2 underline-offset-4"
            >
              <Globe size={16} />
              <span>{item.website}</span>
            </a>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-4">Amenities</h4>
            <div className="flex flex-wrap gap-4 text-[#64748B]">
              <div title="TV" className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:text-[#b49a78] transition-colors"><Monitor size={20} /></div>
              <div title="Breakfast" className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:text-[#b49a78] transition-colors"><UtensilsCrossed size={20} /></div>
              <div title="AC" className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:text-[#b49a78] transition-colors"><Wind size={20} /></div>
              <div title="Security" className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:text-[#b49a78] transition-colors"><ShieldCheck size={20} /></div>
              <div title="Parking" className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:text-[#b49a78] transition-colors"><Car size={20} /></div>
            </div>
          </div>
        </div>

        <button 
          className={`w-full md:w-max px-10 py-5 rounded-2xl text-base font-bold tracking-wider uppercase transition-all shadow-xl hover:-translate-y-1 ${
            item.status === 'No Rooms Available' 
            ? 'bg-[#FF5722] text-white hover:bg-orange-600 shadow-orange-200' 
            : 'bg-[#212529] text-white hover:bg-[#b49a78] shadow-neutral-200'
          }`}
        >
          {item.status}
        </button>
      </div>

      {/* 3. Right Section: Proximity */}
      <div className="w-full lg:w-[280px] bg-[#F8F9FA] rounded-[2rem] p-8 border border-neutral-100 flex flex-col justify-between shrink-0">
        <div>
          <h3 className="text-2xl font-bold text-[#212529] mb-8 font-serif border-b border-neutral-200 pb-4">
            Proximity
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group/prox">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-neutral-400 group-hover/prox:text-[#b49a78] transition-colors border border-white group-hover/prox:border-neutral-100">
                <Plane size={24} />
              </div>
              <div>
                <p className="text-[#212529] font-bold text-lg leading-tight">{item.proximity.airport}</p>
                <p className="text-[#6c757d] text-xs font-semibold uppercase tracking-widest mt-0.5">from Airport</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group/prox">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-neutral-400 group-hover/prox:text-[#b49a78] transition-colors border border-white group-hover/prox:border-neutral-100">
                <TrainFront size={24} />
              </div>
              <div>
                <p className="text-[#212529] font-bold text-lg leading-tight">{item.proximity.railway}</p>
                <p className="text-[#6c757d] text-xs font-semibold uppercase tracking-widest mt-0.5">from Railway</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group/prox">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-neutral-400 group-hover/prox:text-[#b49a78] transition-colors border border-white group-hover/prox:border-neutral-100">
                <Bus size={24} />
              </div>
              <div>
                <p className="text-[#212529] font-bold text-lg leading-tight">{item.proximity.bus}</p>
                <p className="text-[#6c757d] text-xs font-semibold uppercase tracking-widest mt-0.5">from Bus Stop</p>
              </div>
            </div>
          </div>
        </div>

        <a 
          href="#" 
          className="mt-12 flex items-center justify-center gap-2 text-[#FF5722] font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
        >
          View on Map
          <ArrowRight size={18} />
        </a>
      </div>
    </motion.div>
  );
};

const HotelShowcase = () => {
  const { lang, t } = useLanguage();

  return (
    <section id="hotels" className="py-24 bg-[#FAF9F6] relative z-20">
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Modern Section Header */}
        <div className="flex flex-col items-center mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-neutral-100 uppercase tracking-widest text-[10px] font-black text-[#b49a78] mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            Official OTDC Stay
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-[#212529] tracking-tighter leading-tight font-serif"
          >
            Explore <span className="italic text-[#b49a78]">Panthanivas</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#6c757d] text-lg md:text-xl max-w-2xl mt-6 font-medium leading-relaxed"
          >
            Discover the heritage and hospitality of Odisha through our network of official tourist bungalows located at the most scenic spots.
          </motion.p>
        </div>

        {/* List Layout */}
        <div className="w-full max-w-[1400px] mx-auto">
          {panthanivasData.map((item, idx) => (
            <PanthanivasCard key={item.id} item={item} index={idx} />
          ))}
        </div>

        {/* Floating Scroll to Top - Styled to match Panthanivas theme */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="fixed bottom-12 right-12 w-16 h-16 bg-[#212529] hover:bg-[#b49a78] text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:-translate-y-2 cursor-pointer z-50 group border-4 border-white"
          aria-label="Scroll to top"
        >
          <ArrowUp size={28} strokeWidth={3} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default HotelShowcase;
