import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';


export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

const roleDashboard = {
    'admin': '/admin',
    'manager': '/manager',
    'receptionist': '/receptionist',
};

export function RoleRoute({ allowedRoles }) {
    const user = useAuthStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={roleDashboard[user.role] ?? '/login'} replace />;
    }
    return <Outlet />;
}
