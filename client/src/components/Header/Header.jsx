import React from "react";
import useAuthStore from "../../store/authStore";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Determine a simple title based on route for right now
  let title = "Dashboard";
  if (location.pathname.includes("rooms")) title = "Room Management";
  if (location.pathname.includes("bookings")) title = "Reservations";
  if (location.pathname.includes("guests")) title = "Guest Directory";
  if (location.pathname.includes("reports")) title = "Analytics & Reports";

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-outline/15 h-20 flex w-full justify-between items-center px-6 md:px-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-serif text-neutral-900 font-bold">{title}</h1>
        <p className="text-xs text-neutral-500 tracking-widest uppercase mt-0.5">{today}</p>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex gap-4 text-neutral-500">
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">settings</span>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
               <p className="text-xs font-bold text-neutral-900">{user?.name || "Admin User"}</p>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{user?.role || "Administrator"}</p>
            </div>
            <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-primary font-bold overflow-hidden">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
