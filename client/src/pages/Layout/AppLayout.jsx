import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Header from "../../components/Header/Header";

const AppLayout = () => {
  const location = useLocation();

  const isAuthRoute = location.pathname.includes("/auth/");
  if (isAuthRoute) {
    return <Outlet />;
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/20 flex h-screen overflow-hidden w-full">
      <SideBar />
      <main className="flex-1 flex flex-col h-screen bg-surface min-w-0 overflow-hidden">
        <div className="flex-none w-full">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 space-y-10 w-full" id="scrollable-outlet">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
