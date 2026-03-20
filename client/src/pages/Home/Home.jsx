import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     navigate(`/app/${user.role}`);
  //   } else {
  //     navigate("/auth/login");
  //   }
  // }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent flex items-center justify-center animate-spin rounded-full"></div>
    </div>
  );
};

export default Home;