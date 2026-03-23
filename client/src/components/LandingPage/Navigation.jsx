import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Menu } from 'lucide-react';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-6 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/assets/logo.png" 
            alt="Patha Yatri Luxe" 
            className="h-10 w-auto object-contain mix-blend-multiply" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
          />
          <img 
            src="/assets/state.png" 
            alt="Odisha Tourism" 
            className="h-10 w-auto object-contain" 
          />
          <img 
            src="/assets/otdc.png" 
            alt="OTDC" 
            className="h-10 w-auto object-contain" 
          />
          <span className="hidden text-xl font-serif font-bold text-[#111111] uppercase tracking-widest">Luxe</span>
        </div>
        
        {/* Elements */}
        <div className="hidden md:flex items-center gap-10 font-sans tracking-widest text-[11px] font-bold uppercase text-[#737373]">
          <a href="#hotels" className="hover:text-[#b49a78] transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' }) }}>Destinations</a>
          <a href="#hotels" className="text-[#111111] transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' }) }}>Hotels</a>
          <a href="#" className="hover:text-[#b49a78] transition-colors">Flights</a>
          <a href="#bookings" className="hover:text-[#b49a78] transition-colors">Bookings</a>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="hidden md:flex text-xs font-bold tracking-widest font-sans uppercase text-[#111111] hover:text-[#b49a78] transition-colors border-b-2 border-transparent hover:border-[#b49a78] pb-1">
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth/login')}
            className="hidden md:flex items-center gap-2 bg-[#111111] hover:bg-[#b49a78] text-white px-8 py-3.5 rounded-full text-xs font-bold tracking-widest font-sans uppercase transition-all shadow-xl hover:shadow-[#b49a78]/30"
          >
            <User size={16} />
            Sign Up
          </button>
          <button className="md:hidden text-[#111111]">
            <Menu size={24} />
          </button>
        </div>
        
      </div>
    </motion.nav>
  );
};

export default Navigation;
