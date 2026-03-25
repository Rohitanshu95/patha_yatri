import React from "react";

const LuxuryCard = ({ children, className = "", noHover = false, ...props }) => {
  return (
    <div 
      className={`bg-surface p-8 border border-outline/20 ${!noHover ? "hover:border-primary transition-all duration-300 hover:shadow-[0_10px_30px_-15px_rgba(197,160,89,0.1)]" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default LuxuryCard;
