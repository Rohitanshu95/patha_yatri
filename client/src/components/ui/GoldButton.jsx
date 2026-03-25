import React from "react";

const GoldButton = ({ children, onClick, className = "", type = "button", variant = "primary", icon = null, ...props }) => {
  const baseStyle = "px-8 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gold-gradient text-white hover:opacity-90",
    secondary: "border border-outline/30 text-on-surface hover:border-primary hover:text-primary bg-transparent",
    ghost: "text-on-surface-variant hover:text-primary bg-transparent"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      {children}
    </button>
  );
};

export default GoldButton;
