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
import Reports from "./pages/Reports/Reports";
import AuditLogs from "./pages/Audit/AuditLogs";

const App = () => {
  return (
    <div className="h-screen w-full">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/app" element={<AppLayout />}>
          <Route element={<ProtectedRoute />}>
            {/* admin */}
            <Route
              path="admin"
              element={<RoleRoute allowedRoles={["admin"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="audit" element={<AuditLogs />} />
            </Route>
            {/* manager */}
            <Route
              path="manager"
              element={<RoleRoute allowedRoles={["manager"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            {/* receptionist */}
            <Route
              path="receptionist"
              element={<RoleRoute allowedRoles={["receptionist"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="guests" element={<GuestManagement />} />
              <Route path="bookings" element={<Booking />} />
              <Route path="billing" element={<Billing />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
