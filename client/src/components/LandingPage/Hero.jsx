import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const odiaTexts = [
  "ସ୍ୱାଗତ ଓଡ଼ିଶା",
  "ଜୟ ଜଗନ୍ନାଥ",
  "ଅତିଥି ଦେବୋ ଭବ"
];

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('');
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % odiaTexts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (!location && !dates && !guests) {
      toast.info('Please enter destination details');
      return;
    }
    toast.success('Redirecting to login to complete booking...');
    setTimeout(() => navigate('/auth/login'), 1500);
  };

  const handleExplore = () => {
    document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-32 bg-[#faf9f6] w-full overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-[600px] bg-[#b49a78]/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full flex justify-center relative z-20 h-16 items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute text-3xl md:text-5xl font-black tracking-widest text-[#8a6a42] font-serif whitespace-nowrap drop-shadow-sm"
          >
            {odiaTexts[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col gap-8"
        >
          <div className="flex items-center gap-3 bg-white w-max px-5 py-2.5 rounded-full shadow-sm border border-neutral-100 uppercase tracking-widest text-[10px] font-bold">
            <div className="w-8 h-8 rounded-full bg-[#b49a78]/20 flex items-center justify-center text-[#b49a78]">
              ✧
            </div>
            <span className="text-neutral-500">Discover your dream destination</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-serif leading-[0.95] text-[#111111] tracking-tighter">
            Find the <span className="italic text-[#b49a78]">perfect</span> <br />
            place to stay.
          </h1>

          <p className="text-neutral-500 text-lg md:text-xl leading-relaxed max-w-lg font-sans mt-4">
            We provide a variety of the best hotels with the most complete facilities and stunning views to make your vacation perfect.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-8 w-full sm:w-auto">
            <button onClick={handleExplore} className="w-full sm:w-auto bg-[#111111] hover:bg-[#b49a78] text-white px-10 py-5 rounded-full font-sans font-medium transition-colors shadow-2xl hover:shadow-[#b49a78]/30">
              Explore Now
            </button>
            <div className="flex items-center gap-4 cursor-pointer group w-full sm:w-auto mt-4 sm:mt-0 justify-center">
              <div className="w-16 h-16 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-[#b49a78] transition-colors relative overflow-hidden">
                <div className="w-0 h-0 border-t-6 border-t-transparent border-l-[8px] border-l-[#111111] border-b-6 border-b-transparent group-hover:border-l-[#b49a78] transition-colors ml-1 z-10" />
                <div className="absolute inset-0 bg-[#b49a78]/0 group-hover:bg-[#b49a78]/5 transition-colors" />
              </div>
              <span className="font-semibold tracking-wide text-sm font-sans text-[#1E293B] group-hover:text-[#b49a78] transition-colors uppercase">Watch Video</span>
            </div>
          </div>
        </motion.div>

        {/* Right Images (Bento/Mosaic Grid) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative h-[500px] w-full hidden md:block"
        >
          {/* Main Large Image */}
          <div className="absolute top-0 right-10 w-[60%] h-[70%] rounded-3xl overflow-hidden shadow-2xl">
            <img src="/assets/Odisha-Tourism.jpg" alt="Luxury Indian Resort" className="w-full h-full object-cover" />
          </div>
          
          {/* Bottom Left Image */}
          <div className="absolute bottom-10 left-0 w-[45%] h-[40%] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img src="/assets/444_odisha tourist places list.webp" alt="Odisha Tourist Places" className="w-full h-full object-cover" />
          </div>

          {/* Bottom Right Floating Review */}
          <div className="absolute bottom-0 right-0 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-neutral-100 animate-bounce" style={{animationDuration: '3s'}}>
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-10 h-10 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-10 h-10 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/100?img=3" alt="user" className="w-10 h-10 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">10k+ Customers</p>
              <p className="text-[10px] text-[#64748B]">Satisfied around world</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Booking Search Widget (Floating over next section) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-[1200px] mx-auto mt-20 px-6 lg:px-0 relative z-30"
      >
        <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-neutral-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          
          <div className="flex flex-col gap-1 flex-1 border-r border-neutral-100 pr-6 w-full hidden md:block">
            <label className="text-xs font-semibold text-[#64748B] flex items-center gap-2"><MapPin size={14} className="text-[#E8A317]"/> Location</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you going?" 
              className="outline-none border-none font-semibold text-[#1E293B] placeholder-[#94A3B8] text-sm w-full bg-transparent" 
            />
          </div>
          
          <div className="flex flex-col gap-1 flex-1 border-r border-neutral-100 pr-6 w-full hidden md:block">
            <label className="text-xs font-semibold text-[#64748B] flex items-center gap-2"><Calendar size={14} className="text-[#E8A317]"/> Dates</label>
            <input 
              type="text" 
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Check in - Check out" 
              className="outline-none border-none font-semibold text-[#1E293B] placeholder-[#94A3B8] text-sm w-full bg-transparent" 
            />
          </div>

          <div className="flex flex-col gap-1 flex-1 pr-6 w-full">
            <label className="text-xs font-semibold text-[#64748B] flex items-center gap-2"><Users size={14} className="text-[#E8A317]"/> Guests</label>
            <input 
              type="text" 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="2 Adults, 1 Child" 
              className="outline-none border-none font-semibold text-[#1E293B] placeholder-[#94A3B8] text-sm w-full bg-transparent" 
            />
          </div>

          <button onClick={handleSearch} className="w-full md:w-auto bg-[#111111] hover:bg-[#b49a78] text-white p-4 md:px-10 md:py-5 rounded-full font-semibold font-sans tracking-wide flex items-center justify-center gap-3 transition-colors shadow-2xl hover:shadow-[#b49a78]/40">
            <Search size={18} />
            Search
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default Hero;
