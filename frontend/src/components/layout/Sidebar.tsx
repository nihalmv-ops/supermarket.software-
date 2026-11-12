import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Users,
  Package,
  Palette,
  BarChart3,
  Settings,
  CreditCard,
  Building2,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  X,
  LucideIcon,
  LogOut,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeBusiness, myBusinesses, switchBusiness, isLoading } = useBusiness();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const currentBusinessName = activeBusiness?.businessName || 'Silver Business';
  const currentBusinessPlan = activeBusiness?.subscriptionPlan || 'Starter';

  const navigation: NavSection[] = [
    {
      group: 'Core Management',
      items: [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        { name: 'Invoices', to: '/invoices', icon: FileText, badge: '12 Due' },
        { name: 'Quotations', to: '/quotations', icon: FileSpreadsheet },
      ],
    },
    {
      group: 'Catalogs & Tools',
      items: [
        { name: 'Customers', to: '/customers', icon: Users },
        { name: 'Products & Services', to: '/products', icon: Package },
        { name: 'PDF Designer', to: '/pdf-designer', icon: Palette, highlight: 'New' },
      ],
    },
    {
      group: 'Operations & Settings',
      items: [
        { name: 'Financial Reports', to: '/reports', icon: BarChart3 },
        { name: 'Business Settings', to: '/business/profile', icon: Settings },
        { name: 'Subscription Plan', to: '/subscriptions', icon: CreditCard },
      ],
    },
  ];

  // If Super Admin, append platform oversight section
  if (user?.role === 'super_admin') {
    navigation.push({
      group: 'Platform Super Admin',
      items: [
        { name: 'Super Admin Console', to: '/admin/dashboard', icon: ShieldAlert, highlight: 'Admin' },
        { name: 'Tenant Directory', to: '/admin/businesses', icon: Building2 },
      ],
    });
  }

  const handleSelectBusiness = async (businessId: string) => {
    setDropdownOpen(false);
    if (activeBusiness?._id === businessId) return;
    try {
      await switchBusiness(businessId);
    } catch {
      // Handled by context
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-surface-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-surface-900">SILVER</span>
                <span className="text-xs uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                  SUITE
                </span>
              </div>
              <p className="text-[11px] font-medium text-surface-400">Invoice & Quotation SaaS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg lg:hidden hover:bg-surface-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Tenant Business Switcher */}
        <div className="px-4 py-3 relative border-b border-surface-100">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-surface-200 bg-surface-50/70 hover:bg-surface-100/80 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-200 text-surface-700 flex items-center justify-center shrink-0">
                {activeBusiness?.logo ? (
                  <img
                    src={activeBusiness.logo}
                    alt={activeBusiness.businessName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-surface-800 truncate">
                  {currentBusinessName}
                </p>
                <p className="text-[10px] text-surface-400 truncate">
                  {activeBusiness?.gstNumber
                    ? `GST: ${activeBusiness.gstNumber}`
                    : `${currentBusinessPlan} Plan`}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-surface-400 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Business Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-20 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-surface-400 flex items-center justify-between">
                <span>Your Businesses ({myBusinesses.length})</span>
                <span className="text-brand-600 lowercase font-medium">multi-tenant</span>
              </div>

              <div className="max-h-52 overflow-y-auto">
                {myBusinesses.map((biz) => {
                  const isSelected = biz._id === activeBusiness?._id;
                  const isSuspended = biz.status === 'suspended';

                  return (
                    <button
                      key={biz._id}
                      onClick={() => !isSuspended && handleSelectBusiness(biz._id)}
                      disabled={isSuspended}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-50 transition-colors ${
                        isSelected ? 'bg-brand-50/50' : ''
                      } ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="truncate pr-2">
                        <p
                          className={`text-xs ${
                            isSelected ? 'font-bold text-brand-700' : 'font-medium text-surface-700'
                          }`}
                        >
                          {biz.businessName}
                        </p>
                        <span className="text-[10px] text-surface-400">
                          {biz.subscriptionPlan} • {biz.role || 'owner'}
                          {isSuspended && ' (Suspended)'}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-surface-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/business/switch');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-surface-700 hover:bg-surface-50"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-surface-400" />
                  <span>Manage All Businesses</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/business/new');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Business</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
                {section.group}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                          : 'text-surface-600 hover:bg-surface-100/90 hover:text-surface-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <item.icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-white' : 'text-surface-400 group-hover:text-surface-600'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-surface-100 text-surface-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.highlight && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.highlight === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.highlight}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Plan Usage Card & Logout */}
        <div className="p-4 border-t border-surface-100 space-y-2">
          <div className="bg-gradient-to-br from-brand-50 to-surface-100 border border-brand-100/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-brand-900">
                {currentBusinessPlan} Plan
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-600 text-white">
                Active
              </span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-brand-600 h-1.5 rounded-full w-[45%]" />
            </div>
            <div className="flex justify-between items-center text-[11px] text-surface-500">
              <span>Tenant Active</span>
              <NavLink
                to="/subscriptions"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Upgrade
              </NavLink>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-surface-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
