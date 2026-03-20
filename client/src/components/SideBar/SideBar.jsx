import React from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { LayoutDashboard, Users, BedDouble, CalendarDays, ReceiptText, BarChart3, Settings } from "lucide-react";

const SideBar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const links = {
    admin: [
      { name: "Dashboard", path: "/app/admin", icon: <LayoutDashboard size={20} /> },
      { name: "Users", path: "/app/admin/users", icon: <Users size={20} /> },
      { name: "Audit Logs", path: "/app/admin/audit", icon: <Settings size={20} /> },
    ],
    manager: [
      { name: "Dashboard", path: "/app/manager", icon: <LayoutDashboard size={20} /> },
      { name: "Rooms", path: "/app/manager/rooms", icon: <BedDouble size={20} /> },
      { name: "Reports", path: "/app/manager/reports", icon: <BarChart3 size={20} /> },
    ],
    receptionist: [
      { name: "Dashboard", path: "/app/receptionist", icon: <LayoutDashboard size={20} /> },
      { name: "Bookings", path: "/app/receptionist/bookings", icon: <CalendarDays size={20} /> },
      { name: "Guests", path: "/app/receptionist/guests", icon: <Users size={20} /> },
      { name: "Billing", path: "/app/receptionist/billing", icon: <ReceiptText size={20} /> },
    ]
  };

  const navLinks = links[user.role] || [];

  return (
    <div className="w-64 bg-slate-900 h-screen text-gray-300 flex flex-col transition-all">
      <div className="h-16 flex items-center justify-center border-b border-gray-800 text-white font-bold text-xl tracking-wider">
        Patha Yatri
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SideBar;
