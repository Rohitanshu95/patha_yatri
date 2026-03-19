import React from 'react'
import AdminUserManagement from '../Admin/AdminUserManagement';
import ManagerUserManagement from '../Manager/ManagerUserManagement';

const UserManagement = () => {
  const { user } = useAuthStore();

  if (user?.role === "admin") {
    return <AdminUserManagement />;
  }

  if (user?.role === "manager") {
    return <ManagerUserManagement />;
  }

//   return (
//     <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
//       Dashboard for role <span className="ml-1 font-semibold capitalize">{user?.role}</span> — coming soon.
//     </div>
//   );
}

export default UserManagement