import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content wrapper */}
      <div className="main-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
