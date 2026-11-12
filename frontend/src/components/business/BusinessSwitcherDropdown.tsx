import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  ArrowRightLeft,
  Settings,
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

export const BusinessSwitcherDropdown: React.FC = () => {
  const { activeBusiness, myBusinesses, switchBusiness, isLoading } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBusiness = async (businessId: string) => {
    if (activeBusiness?._id === businessId) {
      setIsOpen(false);
      return;
    }
    try {
      await switchBusiness(businessId);
      setIsOpen(false);
    } catch {
      // Error handled by context
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all text-left max-w-[240px]"
      >
        <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {activeBusiness?.logo ? (
            <img
              src={activeBusiness.logo}
              alt={activeBusiness.businessName}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Building2 className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">
            {activeBusiness?.businessName || 'Select Business'}
          </p>
          <p className="text-[10px] text-slate-500 truncate capitalize">
            {activeBusiness?.subscriptionPlan || 'No Plan'} • {activeBusiness?.businessType || 'Suite'}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Your Businesses ({myBusinesses.length})
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">Multi-tenant</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {myBusinesses.map((biz) => {
              const isSelected = activeBusiness?._id === biz._id;
              const isSuspended = biz.status === 'suspended';

              return (
                <button
                  key={biz._id}
                  onClick={() => !isSuspended && handleSelectBusiness(biz._id)}
                  disabled={isSuspended}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-indigo-50/60' : ''
                  } ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      {biz.businessName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="capitalize">{biz.role || 'owner'}</span>
                      <span>•</span>
                      <span>{biz.subscriptionPlan}</span>
                      {isSuspended && (
                        <span className="text-rose-600 font-medium">• Suspended</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 mt-1 pt-1 px-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/business/switch');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              Manage All Businesses
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/business/profile');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              Business Settings & Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/business/new');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New Business
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
