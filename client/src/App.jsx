import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./middleware/guards";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import AppLayout from "./pages/Layout/AppLayout";
import UserManagement from "./pages/UserManagement/UserManagement";

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
              path="/admin"
              element={<RoleRoute allowedRoles={["admin"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            {/* manager */}
            <Route
              path="/manager"
              element={<RoleRoute allowedRoles={["manager"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            {/* receptionist */}
            <Route
              path="/receptionist"
              element={<RoleRoute allowedRoles={["receptionist"]} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Booking />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
