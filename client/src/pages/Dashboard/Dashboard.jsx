import React from 'react'
import useAuthStore from '../../store/authStore';
import ManagerDashboard from '../Manager/ManagerDashboard';
import ReceptionistDashboard from '../Receptionist/ReceptionistDashboard';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  if (user?.role === "receptionist") {
    return <ReceptionistDashboard />;
  }


  // Placeholder for section / officer dashboards (future)
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Dashboard for role <span className="ml-1 font-semibold capitalize">{user?.role}</span> — coming soon.
    </div>
  );
}

export default Dashboard