import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global SaaS Footer */}
        <footer className="py-4 px-6 border-t border-surface-200/80 bg-white/60 text-xs text-surface-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Silver Business Suite. Built for Multi-Tenant Commercial Enterprise.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (TypeScript)</span>
            </span>
            <span className="text-surface-300">|</span>
            <span className="hover:text-surface-700 cursor-pointer">Support & Docs</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
