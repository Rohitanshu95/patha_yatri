import React from 'react';
import { motion } from 'framer-motion';
import { Waves, ParkingCircle, Dog, WashingMachine, Shirt, Coffee, Wifi, Dumbbell } from 'lucide-react';

const facilities = [
  { icon: <Waves size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "AIR CONDITION" },
  { icon: <ParkingCircle size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "FREE PARKING" },
  { icon: <Dog size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "PETS ALLOWED" },
  { icon: <WashingMachine size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "WASHING" },
  { icon: <Shirt size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "LAUNDRY" },
  { icon: <Coffee size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "CAFETERIA" },
  { icon: <Wifi size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "FREE WIFI" },
  { icon: <Dumbbell size={32} strokeWidth={1.5} className="text-[#b49a78] mb-3" />, name: "FITNESS GYM" },
];

const FacilitiesMarquee = () => {
  return (
    <div className="w-full bg-[#F4F6F9] pt-10 pb-8 overflow-hidden flex flex-col items-center">
      
      {/* Infinite Marquee Wrapper */}
      <div className="flex w-[200%] gap-4 animate-[marquee_20s_linear_infinite] hovering-pause">
        {/* We duplicate the array to trigger the seamless scrolling effect */}
        {[...facilities, ...facilities, ...facilities].map((fac, idx) => (
          <div 
            key={idx} 
            className="flex-shrink-0 w-64 bg-white rounded-[2.5rem] py-8 flex flex-col items-center justify-center shadow-sm border border-neutral-100 mx-2 hover:shadow-md transition-shadow cursor-default"
          >
            {fac.icon}
            <span className="text-[#1e293b] font-bold text-sm tracking-wide uppercase font-sans">
              {fac.name}
            </span>
          </div>
        ))}
      </div>

      {/* Tailwind specific custom animation config (add to index.css if not native) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .hovering-pause:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default FacilitiesMarquee;
