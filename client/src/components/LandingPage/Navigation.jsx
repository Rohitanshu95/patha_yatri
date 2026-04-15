import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Menu, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm">
      {/* Official State Header - White Bar */}
      <div className="bg-white py-5 border-t-[4px] border-[#212529] border-b border-gray-100 hidden md:block">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6">
               <img 
                src="/assets/otdc.png" 
                alt="OTDC" 
                className="h-24 w-auto object-contain"
              />
               <img 
                src="/assets/state.png" 
                alt="Odisha Tourism" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="h-14 w-[1px] bg-gray-300 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[#212529] font-bold text-2xl leading-tight tracking-tight uppercase">
                {t.nav.corpName}
              </span>
              <span className="text-[#6c757d] text-sm font-semibold">
                {t.nav.corpSub}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-10">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-50 rounded-full px-1 py-1 border border-gray-100 shadow-inner">
              <button 
                onClick={() => setLanguage('eng')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${lang === 'eng' ? 'bg-[#212529] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ori')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${lang === 'ori' ? 'bg-[#212529] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>

            {/* CM Section */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[#212529] font-bold text-lg leading-tight uppercase">{t.nav.cmName}</div>
                <div className="text-[#6c757d] text-xs font-bold uppercase tracking-[0.15em]">{t.nav.cmTitle}</div>
              </div>
              <div className="w-24 h-24 overflow-hidden">
                <img 
                  src="https://otdc.odisha.gov.in/assets/user/images/CM-Mohan%20Charan%20Majhi.png" 
                  alt="Hon'ble Chief Minister"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = 'https://otdc.odisha.gov.in/assets/user/images/hcm.png'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Dark Bar */}
      <motion.nav 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full transition-all duration-300 ${
          scrolled ? 'bg-[#212529]/95 backdrop-blur-lg shadow-lg py-3' : 'bg-[#212529] py-4'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center text-white">
          
          {/* Mobile Logo Only */}
          <div className="flex md:hidden items-center gap-3">
            <img src="/assets/otdc.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">OTDC</span>
            <div className="flex ml-4 gap-2">
               <button onClick={() => setLanguage('eng')} className={`text-[8px] ${lang === 'eng' ? 'font-bold' : 'opacity-50'}`}>EN</button>
               <button onClick={() => setLanguage('ori')} className={`text-[10px] ${lang === 'ori' ? 'font-bold' : 'opacity-50'}`}>ଓଡ୍</button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10 font-sans tracking-[0.2em] text-[11px] font-bold uppercase text-white/70">
            <a href="/" className="text-white border-b-2 border-[#b49a78] pb-1">{t.nav.home}</a>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
              <a href="#hotels">{t.nav.destinations}</a>
              <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
              <a href="#hotels">{t.nav.hotels}</a>
              <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
            </div>
            <a href="#" className="hover:text-white transition-colors">{t.nav.flights}</a>
            <a href="#bookings" className="hover:text-white transition-colors">{t.nav.bookings}</a>
            <a href="#" className="hover:text-white transition-colors">{t.nav.packages}</a>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="hidden md:flex text-[10px] font-bold tracking-widest font-sans uppercase text-white/70 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
              {t.nav.signIn}
            </button>
            <button 
              onClick={() => navigate('/auth/login')}
              className="flex items-center gap-2 bg-[#b49a78] hover:bg-white hover:text-[#212529] text-white px-6 py-2.5 rounded-sm text-[10px] font-bold tracking-widest font-sans uppercase transition-all shadow-lg"
            >
              <User size={14} />
              {t.nav.account}
            </button>
            <button className="md:hidden text-white p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>
    </header>
  );
};

export default Navigation;
