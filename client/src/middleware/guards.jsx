import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

const roleDashboard = {
    'admin': '/app/admin',
    'manager': '/app/manager',
    'receptionist': '/app/receptionist',
};

export function RoleRoute({ allowedRoles }) {
    const user = useAuthStore((s) => s.user);
    if (!user) return <Navigate to="/auth/login" replace />;
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={roleDashboard[user.role] ?? '/auth/login'} replace />;
    }
    return <Outlet />;
}
