import React from 'react';
import useAuthStore from '../../store/authStore';
import { LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="text-xl font-semibold text-gray-700">
        Welcome, {user?.name || 'User'}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium capitalize">
            {user?.role || 'Guest'}
          </span>
          <UserCircle size={32} className="text-gray-400" />
        </div>
        <div className="h-8 border-l border-gray-300 mx-2"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;