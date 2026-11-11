import { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  FileText,
  FileSpreadsheet,
  UserPlus,
  PackagePlus,
  ChevronDown
} from 'lucide-react';
import { checkApiHealth } from '../../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps): JSX.Element {
  const [backendStatus, setBackendStatus] = useState<{ checked: boolean; isOnline: boolean }>({
    checked: false,
    isOnline: false,
  });
  const [quickCreateOpen, setQuickCreateOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const testConnection = async () => {
      const res = await checkApiHealth();
      if (mounted) {
        setBackendStatus({ checked: true, isOnline: res.isOnline });
      }
    };
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-surface-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-surface-500 hover:text-surface-800 rounded-lg lg:hidden hover:bg-surface-100 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search invoices, clients, quotations... (Ctrl + K)"
            className="w-full pl-10 pr-12 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-surface-400"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-surface-400 bg-surface-100 border border-surface-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions, Backend Health Indicator & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Backend Connectivity Status Indicator */}
        <div
          title={backendStatus.isOnline ? 'Express Backend Online (Port 5000)' : 'Connecting to Express API...'}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            backendStatus.isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {backendStatus.isOnline ? 'API Connected' : 'API Connecting'}
          </span>
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickCreateOpen(!quickCreateOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-surface-200 py-1.5 z-40">
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  window.location.hash = '/invoices';
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-surface-800">New Invoice</p>
                  <p className="text-[10px] text-surface-400">Bill a client with GST</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  window.location.hash = '/quotations';
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-surface-800">New Quotation</p>
                  <p className="text-[10px] text-surface-400">Generate estimate / proposal</p>
                </div>
              </button>

              <div className="border-t border-surface-100 my-1" />

              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  window.location.hash = '/customers';
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-surface-400" />
                <span>Add Customer</span>
              </button>

              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  window.location.hash = '/products';
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <PackagePlus className="w-4 h-4 text-surface-400" />
                <span>Add Product / Service</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setQuickCreateOpen(false);
            }}
            className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-surface-200 p-3 z-40">
              <div className="flex items-center justify-between pb-2 border-b border-surface-100 mb-2">
                <span className="text-xs font-bold text-surface-800">Notifications</span>
                <span className="text-[10px] text-brand-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-brand-50/50 border border-brand-100/50">
                  <p className="font-semibold text-brand-900">Invoice #INV-2026-088 Paid</p>
                  <p className="text-[11px] text-surface-500">₹45,200 received from Horizon Labs</p>
                  <span className="text-[9px] text-surface-400">12 mins ago</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-50 border border-surface-100">
                  <p className="font-semibold text-surface-800">Quotation #QT-1049 Expiring</p>
                  <p className="text-[11px] text-surface-500">Valid until tomorrow for Zenith Corp</p>
                  <span className="text-[9px] text-surface-400">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-surface-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand-100">
            NA
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-surface-800 leading-none">Nihal Admin</p>
            <p className="text-[10px] text-surface-400 mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
