import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const SideBar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const links = {
    admin: [
      { name: "Dashboard", path: "/app/admin", icon: "dashboard" },
      { name: "Users", path: "/app/admin/users", icon: "group" },
      { name: "Rooms", path: "/app/admin/rooms", icon: "bed" },
      { name: "Reports", path: "/app/admin/reports", icon: "assessment" },
      { name: "Audit Logs", path: "/app/admin/audit", icon: "history" },
      { name: "Settings", path: "/app/admin/settings", icon: "settings" }
    ],
    manager: [
      { name: "Dashboard", path: "/app/manager", icon: "dashboard" },
      { name: "Rooms", path: "/app/manager/rooms", icon: "bed" },
      { name: "Reports", path: "/app/manager/reports", icon: "assessment" },
    ],
    receptionist: [
      { name: "Dashboard", path: "/app/receptionist", icon: "dashboard" },
      { name: "Reservations", path: "/app/receptionist/bookings", icon: "calendar_month" },
      { name: "Guest Folios", path: "/app/receptionist/guests", icon: "contact_page" },
      { name: "Housekeeping", path: "/app/receptionist/rooms", icon: "cleaning_services" },
    ]
  };

  const navLinks = links[user.role] || [];

  return (
    <aside className="h-screen w-64 flex-shrink-0 bg-surface-container border-r border-outline/15 flex flex-col py-8 z-20">
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="w-10 h-10 rounded-none border border-primary flex items-center justify-center bg-surface">
          <span className="text-primary font-serif text-lg">PY</span>
        </div>
        <div>
          <h2 className="text-xl font-serif tracking-widest text-on-surface uppercase">Patha Yatri</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">Luxe Management</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname.includes(link.path);
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 py-3 px-8 transition-all ${
                isActive 
                  ? "text-on-surface font-semibold bg-surface border-r-2 border-primary" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-dim"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "text-primary" : ""}`}>
                {link.icon}
              </span>
              <span className="text-sm tracking-tight">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-8 pt-6 border-t border-outline/15">
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-4 py-3 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;

