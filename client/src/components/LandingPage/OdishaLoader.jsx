import React, { useEffect, useState } from 'react';

const OdishaLoader = ({ onComplete }) => {
  const [stage, setStage] = useState('entering'); 

  useEffect(() => {
    // Prevent scrolling while loader is active
    document.body.style.overflow = 'hidden';
    
    // Switch to active state (fades elements in)
    const activeTimer = setTimeout(() => {
      setStage('active');
    }, 100);

    // Switch to exiting state (fades the whole wrapper out)
    const exitTimer = setTimeout(() => {
      setStage('exiting');
    }, 2800);

    // Call onComplete when animation is fully done
    const doneTimer = setTimeout(() => {
      setStage('done');
      document.body.style.overflow = 'unset';
      if (onComplete) onComplete();
    }, 3500); // 2800 timeout + 700ms transition duration

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = 'unset';
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#1E293B] transition-opacity duration-700 ease-in-out
        ${stage === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] flex items-center justify-center">
        
        {/* The Konark Wheel - Rotating Background */}
        <div 
          className="absolute inset-0 origin-center animate-[spin_10s_linear_infinite]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#C5A059] opacity-30 drop-shadow-2xl">
            {/* Outer Rim */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
            
            {/* 24 Spokes */}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const isMajor = i % 3 === 0;
              return (
                <line 
                  key={i} 
                  x1="50" y1="50" 
                  x2={50 + 48 * Math.cos(angle)} 
                  y2={50 + 48 * Math.sin(angle)} 
                  stroke="currentColor" 
                  strokeWidth={isMajor ? "1.2" : "0.4"} 
                />
              );
            })}
            
            {/* Inner Hub */}
            <circle cx="50" cy="50" r="12" fill="#1E293B" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
        </div>

        {/* The Jagannath Eyes - Fading and Scaling In */}
        <div 
          className={`absolute flex flex-col items-center justify-center transition-all duration-1000 ease-out z-10
            ${stage === 'entering' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}
          `}
        >
          {/* U-shaped Tilak mark (optional stylistic addition) */}
          <svg viewBox="0 0 100 40" className="w-16 h-6 md:w-20 md:h-8 text-[#D32F2F] mb-1 drop-shadow-lg">
            <path d="M 30,5 C 30,35 70,35 70,5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="18" r="5" fill="currentColor" />
          </svg>
          
          <div className="flex gap-4 md:gap-6 mt-2">
            {/* Left Eye */}
            <svg viewBox="0 0 100 100" className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] drop-shadow-2xl">
              <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="3" />
              <circle cx="50" cy="50" r="34" fill="#D32F2F" />
              <circle cx="50" cy="50" r="18" fill="#1A1A1A" />
              <circle cx="56" cy="44" r="5" fill="#FFFFFF" opacity="0.9" />
            </svg>
            
            {/* Right Eye */}
            <svg viewBox="0 0 100 100" className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] drop-shadow-2xl">
              <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="3" />
              <circle cx="50" cy="50" r="34" fill="#D32F2F" />
              <circle cx="50" cy="50" r="18" fill="#1A1A1A" />
              <circle cx="56" cy="44" r="5" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>
          
          {/* Abstract Smile / Base */}
          <svg viewBox="0 0 100 30" className="w-24 h-6 md:w-32 md:h-8 text-[#D32F2F] mt-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            <path d="M 10,5 Q 50,35 90,5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>

        {/* Optional Branding Text fading in late */}
        <div className={`absolute -bottom-16 md:-bottom-24 text-[#C5A059] font-serif tracking-widest text-lg md:text-xl uppercase transition-all duration-1000 ease-in
            ${stage === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} delay-[600ms]
        `}>
          Patha Yatri
        </div>

      </div>
    </div>
  );
};

export default OdishaLoader;
