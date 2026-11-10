import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 flex flex-col md:flex-row font-sans text-brand-darkText dark:text-gray-100 transition-colors duration-200">
      {/* Desktop Left Sidebar (md: and above) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Header (Both Desktop and Mobile Top App Bar) */}
        <TopNav />

        {/* Inner Page Container / Outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <BottomNav />
    </div>
  );
}
