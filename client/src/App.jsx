import React from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./middleware/guards";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import AppLayout from "./pages/Layout/AppLayout";
import UserManagement from "./pages/UserManagement/UserManagement";
import Dashboard from "./pages/Dashboard/Dashboard";
import Booking from "./pages/Booking/Booking";
import RoomManagement from "./pages/Rooms/RoomManagement";
import GuestManagement from "./pages/Guests/GuestManagement";
import Billing from "./pages/Billing/Billing";
import BillingDetail from "./pages/Billing/BillingDetail";
import Reports from "./pages/Reports/Reports";
import AuditLogs from "./pages/Audit/AuditLogs";
import SystemSettings from "./pages/Settings/SystemSettings";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import BookingDetails from "./pages/Booking/BookingDetails";
import { ToastContainer } from "react-toastify";

import { LanguageProvider } from "./context/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <div className="h-screen w-full">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          {/* ... existing routes ... */}
          <Route path="/app" element={<AppLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="admin" element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
              <Route path="manager" element={<RoleRoute allowedRoles={["manager"]} />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="receptionist" element={<RoleRoute allowedRoles={["receptionist"]} />}>
                <Route index element={<Dashboard />} />
                <Route path="guests" element={<GuestManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="bookings" element={<Booking />} />
                <Route path="bookings/:id" element={<BookingDetails />} />
                <Route path="billing" element={<Billing />} />
                <Route path="billing/:bookingId" element={<BillingDetail />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </div>
    </LanguageProvider>
  );
};

export default App;
