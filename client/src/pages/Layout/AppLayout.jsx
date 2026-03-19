import React from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from '../../components/SideBar/SideBar';
import Header from '../../components/Header/Header';

const AppLayout = () => {
  const location = useLocation();

  const isAuthRoute = location.pathname.includes("/auth/");
  if (isAuthRoute) {
    // console.log("🔓 Rendering auth route without layout");
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F3] font-sans">
      <div className="flex flex-1 w-full relative">
        {/* sticky sidebar */}
        <div className="sticky top-0 h-screen">
            <SideBar />
        </div>

        <main className="flex-1 w-full wrap-break-word">
          {/* sticky header */}
          <div className="sticky top-0 z-50">
            <Header />
          </div>

          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout